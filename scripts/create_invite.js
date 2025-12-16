#!/usr/bin/env node

/**
 * Invite Script - Create new client user
 *
 * Usage:
 *   node scripts/create_invite.js <email> <business_name> [full_name] [phone]
 *
 * Example:
 *   node scripts/create_invite.js john@acme.com "Acme Corp" "John Doe" "+1234567890"
 *
 * Requirements:
 *   - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local
 *   - User will receive a password reset email to set their password
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');

  if (!fs.existsSync(envPath)) {
    console.error('❌ Error: .env.local file not found!');
    console.error('   Please create .env.local with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');

  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    }
  });
}

loadEnv();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing required environment variables!');
  console.error('');
  console.error('Please add to .env.local:');
  console.error('  VITE_SUPABASE_URL=your_supabase_url');
  console.error('  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  console.error('');
  console.error('Get your service role key from:');
  console.error('  Supabase Dashboard → Project Settings → API → service_role key');
  process.exit(1);
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('❌ Usage: node scripts/create_invite.js <email> <business_name> [full_name] [phone]');
  console.error('');
  console.error('Example:');
  console.error('  node scripts/create_invite.js john@acme.com "Acme Corp" "John Doe" "+1234567890"');
  process.exit(1);
}

const [email, businessName, fullName = email, phone = null] = args;

// Validate email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.error('❌ Error: Invalid email format');
  process.exit(1);
}

console.log('\n🚀 Creating invite for new client...\n');
console.log(`📧 Email: ${email}`);
console.log(`🏢 Business: ${businessName}`);
console.log(`👤 Name: ${fullName}`);
if (phone) console.log(`📱 Phone: ${phone}`);
console.log('');

// Generate a secure random password
function generatePassword(length = 16) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

const tempPassword = generatePassword();

// Create user via Supabase Admin API
async function createUser() {
  try {
    // Step 1: Create auth user
    console.log('📝 Creating auth user...');

    const createUserResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY
      },
      body: JSON.stringify({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          business_name: businessName,
          full_name: fullName,
          phone: phone
        }
      })
    });

    if (!createUserResponse.ok) {
      const error = await createUserResponse.json();
      throw new Error(error.message || 'Failed to create user');
    }

    const userData = await createUserResponse.json();
    console.log('✅ Auth user created successfully!');
    console.log(`   User ID: ${userData.id}`);

    // Step 2: Trigger will auto-create client record
    // Wait a moment for the trigger to execute
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 3: Verify client record was created
    console.log('');
    console.log('🔍 Verifying client record...');

    const verifyResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/clients?user_id=eq.${userData.id}&select=*`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY
        }
      }
    );

    if (!verifyResponse.ok) {
      console.warn('⚠️  Warning: Could not verify client record');
    } else {
      const clients = await verifyResponse.json();
      if (clients.length > 0) {
        console.log('✅ Client record created successfully!');
        console.log(`   Client ID: ${clients[0].id}`);
        console.log(`   Status: ${clients[0].status}`);
      } else {
        console.warn('⚠️  Warning: Client record not found (trigger may need manual execution)');
      }
    }

    // Step 4: Send password reset email
    console.log('');
    console.log('📨 Sending password reset email...');

    const resetResponse = await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY
      },
      body: JSON.stringify({
        email: email
      })
    });

    if (!resetResponse.ok) {
      console.warn('⚠️  Warning: Could not send password reset email');
      console.warn('   User can still log in with temporary password');
    } else {
      console.log('✅ Password reset email sent!');
    }

    // Success summary
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ CLIENT INVITE CREATED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('');
    console.log('1. The user will receive a password reset email at:');
    console.log(`   ${email}`);
    console.log('');
    console.log('2. They should click the link and set their password.');
    console.log('');
    console.log('3. If no email arrives, share this temporary password:');
    console.log(`   ${tempPassword}`);
    console.log('   (They should change it immediately after first login)');
    console.log('');
    console.log('4. Login URL:');
    console.log('   http://localhost:3000 → Client Portal');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════════════════════════');
    console.error('❌ ERROR CREATING INVITE');
    console.error('═══════════════════════════════════════════════════════════');
    console.error('');
    console.error(`Error: ${error.message}`);
    console.error('');

    if (error.message.includes('already registered')) {
      console.error('💡 This email is already registered.');
      console.error('   Try resetting the password instead.');
    } else if (error.message.includes('service_role')) {
      console.error('💡 Check your SUPABASE_SERVICE_ROLE_KEY in .env.local');
      console.error('   Get it from: Supabase Dashboard → Project Settings → API');
    }

    console.error('');
    process.exit(1);
  }
}

// Run the script
createUser();
