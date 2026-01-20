import { createSupabaseAdmin } from '@/lib/supabase';
import { Chat } from '@/lib/chatStorage';

// Generate or get a session ID for anonymous users
export function getSessionId(): string {
  if (typeof window === 'undefined') {
    console.error('getSessionId called on server side - returning empty string');
    return '';
  }
  
  let sessionId = localStorage.getItem('trexai_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('trexai_session_id', sessionId);
    console.log('Created new session ID:', sessionId);
  } else {
    console.log('Using existing session ID:', sessionId);
  }
  return sessionId;
}

// Get or create a user by session ID or authenticated user ID
export async function getOrCreateUser(sessionId: string, authUserId?: string, authUserEmail?: string): Promise<string | null> {
  try {
    const adminClient = createSupabaseAdmin();
    console.log('=== getOrCreateUser START ===');
    console.log('Looking for user with sessionId:', sessionId, 'authUserId:', authUserId, 'email:', authUserEmail);
    
    // If user is authenticated, use their auth user ID
    if (authUserId) {
      // Check if user exists in our users table
      const { data: existingUser } = await adminClient
        .from('users')
        .select('id, email')
        .eq('auth_user_id', authUserId)
        .maybeSingle();

      if (existingUser) {
        console.log('Found existing authenticated user:', existingUser.id);
        // Always update email if we have it (even if it's the same, to ensure it's saved)
        const updateData: any = { last_active: new Date().toISOString() };
        if (authUserEmail) {
          updateData.email = authUserEmail;
          console.log('Updating user email to:', authUserEmail);
        }
        await adminClient
          .from('users')
          .update(updateData)
          .eq('id', existingUser.id);
        return existingUser.id;
      }

      // Create new user with auth_user_id and email
      const { data: newUser, error: createError } = await adminClient
        .from('users')
        .insert({
          auth_user_id: authUserId,
          email: authUserEmail || null,
          session_id: sessionId, // Keep session_id for backward compatibility
          last_active: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Failed to create authenticated user:', createError);
        return null;
      }

      console.log('Successfully created authenticated user:', newUser.id);
      return newUser.id;
    }
    
    // Fallback to anonymous user (session ID only)
    // First, try to find existing user
    const { data: existingUser, error: findError } = await adminClient
      .from('users')
      .select('id')
      .eq('session_id', sessionId)
      .is('auth_user_id', null) // Only match anonymous users
      .maybeSingle();

    if (existingUser && !findError) {
      console.log('Found existing anonymous user:', existingUser.id);
      await adminClient
        .from('users')
        .update({ last_active: new Date().toISOString() })
        .eq('id', existingUser.id);
      return existingUser.id;
    }

    if (findError && findError.code !== 'PGRST116') {
      console.error('Error finding user:', findError);
    }

    // Create new anonymous user
    console.log('Creating new anonymous user with sessionId:', sessionId);
    const { data: newUser, error: createError } = await adminClient
      .from('users')
      .insert({
        session_id: sessionId,
        last_active: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (createError) {
      console.error('Failed to create user:', createError);
      return null;
    }

    if (!newUser) {
      console.error('No user data returned after insert');
      return null;
    }

    console.log('Successfully created anonymous user:', newUser.id);
    console.log('=== getOrCreateUser END ===');
    return newUser.id;
  } catch (error: any) {
    console.error('Error in getOrCreateUser:', error);
    return null;
  }
}

// Save chat to database
export async function saveChatToDB(
  chatId: string,
  messages: any[],
  aiModel: string,
  incognito: boolean = false,
  authUserId?: string
): Promise<string> {
  if (incognito) return chatId; // Don't save incognito chats

  try {
    const adminClient = createSupabaseAdmin();
    const sessionId = getSessionId();
    if (!sessionId) {
      console.error('No session ID available');
      return chatId;
    }

    const userId = await getOrCreateUser(sessionId, authUserId);
    if (!userId) {
      console.error('Failed to get/create user');
      return chatId;
    }

    const lastUserMessage = messages.filter((m) => m.role === 'user').pop();
    const lastMessage = lastUserMessage?.content || 'No messages';

    // Generate title from first message
    let title = 'New Chat';
    const firstUserMessage = messages.find((m) => m.role === 'user');
    if (firstUserMessage?.content) {
      title = firstUserMessage.content.substring(0, 50);
      if (firstUserMessage.content.length > 50) title += '...';
    }

    // Generate summary
    let summary = 'No summary available';
    const userMessages = messages.filter((m) => m.role === 'user').slice(0, 3);
    if (userMessages.length > 0) {
      summary = userMessages.map((m) => m.content).join(' | ').substring(0, 100);
      if (summary.length === 100) summary += '...';
    }

    // Check if chat exists
    const { data: existingChat } = await adminClient
      .from('chats')
      .select('id')
      .eq('id', chatId)
      .single();

    const chatData = {
      id: chatId,
      user_id: userId,
      title,
      summary,
      ai_model: aiModel,
      message_count: messages.length,
      updated_at: new Date().toISOString(),
      is_incognito: incognito,
    };

    if (existingChat) {
      // Update existing chat
      await adminClient
        .from('chats')
        .update(chatData)
        .eq('id', chatId);
    } else {
      // Create new chat
      await adminClient
        .from('chats')
        .insert({
          ...chatData,
          created_at: new Date().toISOString(),
        });
    }

    // Save messages
    // First, delete old messages for this chat
    await adminClient
      .from('messages')
      .delete()
      .eq('chat_id', chatId);

    // Then insert all messages
    const messagesToInsert = messages.map((msg, index) => ({
      chat_id: chatId,
      role: msg.role,
      content: msg.content,
      sequence_number: index,
    }));

    if (messagesToInsert.length > 0) {
      await adminClient
        .from('messages')
        .insert(messagesToInsert);
    }

    // Note: message_count is now updated in the API route when messages are sent
    // This is kept here as a backup/fallback, but it might double-count
    // The API route increments by 1 per message sent, which is more accurate

    return chatId;
  } catch (error) {
    console.error('Failed to save chat to database:', error);
    return chatId; // Return original chatId on error
  }
}

// Get chats for current user
export async function getChatsFromDB(authUserId?: string): Promise<Chat[]> {
  try {
    const adminClient = createSupabaseAdmin();
    const sessionId = getSessionId();
    if (!sessionId && !authUserId) return [];

    // Get user ID - prefer authenticated user, fallback to session
    let user;
    if (authUserId) {
      const { data } = await adminClient
        .from('users')
        .select('id')
        .eq('auth_user_id', authUserId)
        .maybeSingle();
      user = data;
    } else if (sessionId) {
      const { data } = await adminClient
        .from('users')
        .select('id')
        .eq('session_id', sessionId)
        .maybeSingle();
      user = data;
    }

    if (!user) return [];

    // Get chats for this user
    const { data: chats, error } = await adminClient
      .from('chats')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching chats:', error);
      return [];
    }

    // Convert to Chat format
    return (chats || []).map((chat) => ({
      id: chat.id,
      title: chat.title || 'New Chat',
      summary: chat.summary || 'No summary',
      lastMessage: chat.summary || 'No messages',
      timestamp: new Date(chat.updated_at || chat.created_at).getTime(),
      aiModel: chat.ai_model || 'myai',
      messageCount: chat.message_count || 0,
    }));
  } catch (error) {
    console.error('Error in getChatsFromDB:', error);
    return [];
  }
}

// Get messages for a specific chat
export async function getChatMessagesFromDB(chatId: string): Promise<any[] | null> {
  try {
    const adminClient = createSupabaseAdmin();
    const { data: messages, error } = await adminClient
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('sequence_number', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return null;
    }

    return (messages || []).map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  } catch (error) {
    console.error('Error in getChatMessagesFromDB:', error);
    return null;
  }
}

// Delete a chat
export async function deleteChatFromDB(chatId: string): Promise<boolean> {
  try {
    const adminClient = createSupabaseAdmin();
    const { error } = await adminClient
      .from('chats')
      .delete()
      .eq('id', chatId);

    if (error) {
      console.error('Error deleting chat:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteChatFromDB:', error);
    return false;
  }
}

// Track analytics event
export async function trackAnalyticsEvent(
  userId: string | null,
  eventType: string,
  aiModel?: string,
  metadata?: any
): Promise<void> {
  try {
    if (!userId) {
      console.warn('trackAnalyticsEvent called with null userId - skipping');
      return;
    }
    
    const adminClient = createSupabaseAdmin();
    console.log('Inserting analytics event:', { userId, eventType, aiModel });
    
    const { data, error } = await adminClient
      .from('analytics_events')
      .insert({
        user_id: userId,
        event_type: eventType,
        ai_model: aiModel || null,
        metadata: metadata || {},
      })
      .select();
    
    if (error) {
      console.error('Error inserting analytics event:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      throw error;
    }
    
    if (data && data.length > 0) {
      console.log('Analytics event inserted successfully:', data[0].id, 'at', data[0].created_at);
    } else {
      console.warn('Analytics event insert returned no data');
    }
  } catch (error: any) {
    console.error('Error tracking analytics event:', error);
    console.error('Error details:', error?.message, error?.code, error?.details);
    // Don't throw - analytics failures shouldn't break the app, but log everything
  }
}
