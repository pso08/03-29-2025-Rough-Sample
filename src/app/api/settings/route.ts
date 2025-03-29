/**
 * User Settings API Routes
 * 
 * This file handles retrieving and updating user settings.
 */

import { NextRequest, NextResponse } from 'next/server';
import { D1Database } from '@cloudflare/workers-types';
import { getAuthenticatedUser } from '@/lib/auth-utils';

// Get user settings
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const db = (process.env.DB as unknown) as D1Database;
    
    // Get user settings
    const settings = await db
      .prepare('SELECT * FROM user_settings WHERE user_id = ?')
      .bind(user.userId)
      .first();
    
    if (!settings) {
      // Create default settings if not found
      const defaultSettings = {
        user_id: user.userId,
        dark_mode: false,
        font_size: 'medium',
        auto_flip_timer: 10,
        show_explanations: true
      };
      
      await db
        .prepare(`
          INSERT INTO user_settings 
          (user_id, dark_mode, font_size, auto_flip_timer, show_explanations) 
          VALUES (?, ?, ?, ?, ?)
        `)
        .bind(
          user.userId,
          defaultSettings.dark_mode ? 1 : 0,
          defaultSettings.font_size,
          defaultSettings.auto_flip_timer,
          defaultSettings.show_explanations ? 1 : 0
        )
        .run();
      
      return NextResponse.json({
        settings: defaultSettings
      });
    }
    
    // Convert boolean fields
    const formattedSettings = {
      ...settings,
      dark_mode: settings.dark_mode === 1,
      show_explanations: settings.show_explanations === 1
    };
    
    return NextResponse.json({
      settings: formattedSettings
    });
    
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user settings' },
      { status: 500 }
    );
  }
}

// Update user settings
export async function PUT(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    const db = (process.env.DB as unknown) as D1Database;
    
    // Check if settings exist
    const existingSettings = await db
      .prepare('SELECT user_id FROM user_settings WHERE user_id = ?')
      .bind(user.userId)
      .first();
    
    if (existingSettings) {
      // Update existing settings
      let query = 'UPDATE user_settings SET';
      const queryParams: any[] = [];
      
      if (data.darkMode !== undefined) {
        query += ' dark_mode = ?,';
        queryParams.push(data.darkMode ? 1 : 0);
      }
      
      if (data.fontSize) {
        query += ' font_size = ?,';
        queryParams.push(data.fontSize);
      }
      
      if (data.autoFlipTimer !== undefined) {
        query += ' auto_flip_timer = ?,';
        queryParams.push(data.autoFlipTimer);
      }
      
      if (data.showExplanations !== undefined) {
        query += ' show_explanations = ?,';
        queryParams.push(data.showExplanations ? 1 : 0);
      }
      
      // Remove trailing comma
      query = query.slice(0, -1);
      
      query += ' WHERE user_id = ?';
      queryParams.push(user.userId);
      
      await db
        .prepare(query)
        .bind(...queryParams)
        .run();
    } else {
      // Create new settings
      await db
        .prepare(`
          INSERT INTO user_settings 
          (user_id, dark_mode, font_size, auto_flip_timer, show_explanations) 
          VALUES (?, ?, ?, ?, ?)
        `)
        .bind(
          user.userId,
          data.darkMode ? 1 : 0,
          data.fontSize || 'medium',
          data.autoFlipTimer || 10,
          data.showExplanations ? 1 : 0
        )
        .run();
    }
    
    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating user settings:', error);
    return NextResponse.json(
      { error: 'Failed to update user settings' },
      { status: 500 }
    );
  }
}
