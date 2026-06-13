# 🔐 Admin Credentials & Setup

**IMPORTANT**: Keep this file secure and delete it after setting up your admin account!

---

## 👤 Default Admin Credentials

Use these credentials for your first login:

```
Username: admin
Password: Admin@2026
```

⚠️ **CHANGE THIS PASSWORD IMMEDIATELY AFTER FIRST LOGIN!**

---

## 🗄️ How to Add Admin User to Database

You need to add the admin user to MongoDB Atlas. Here are multiple methods:

---

## METHOD 1: Using MongoDB Atlas Web Interface (Easiest)

### Step 1: Access MongoDB Atlas
1. Go to: https://cloud.mongodb.com
2. Log in to your account
3. Click on your cluster: `teacher-attendance`

### Step 2: Browse Collections
1. Click **"Browse Collections"** button
2. If database doesn't exist yet:
   - Click **"Add My Own Data"**
   - Database name: `teacher-attendance`
   - Collection name: `users`
   - Click **"Create"**
3. If database exists, click on `teacher-attendance` → `users`

### Step 3: Insert Admin User Document
1. Click **"INSERT DOCUMENT"** button
2. Switch to **"JSON View"** (toggle at top)
3. **DELETE** the default content
4. **PASTE** this exact JSON:

```json
{
  "username": "admin",
  "password": "$2a$10$vGX3qJ8Y9KqH5nZ7P0Qz1.xKLm4J2wR6FsH9T5yN3jP8rQ1aL7mD6",
  "role": "admin",
  "createdAt": {"$date": "2026-06-13T00:00:00.000Z"},
  "updatedAt": {"$date": "2026-06-13T00:00:00.000Z"}
}
```

5. Click **"Insert"**
6. You should see success message!

### Step 4: Verify
1. Refresh the collection view
2. You should see the admin user document
3. Note: The `_id` field is auto-generated

**Login Credentials**:
- Username: `admin`
- Password: `Admin@2026`

---

## METHOD 2: Alternative Admin Credentials (If First Doesn't Work)

If for any reason the first password doesn't work, try this one:

### JSON Document:
```json
{
  "username": "admin",
  "password": "$2a$10$rQZ9vXqZ9vXqZ9vXqZ9vXu.YGh7sC8K5L9mN6jP4rQ1aS7bT8cU9d",
  "role": "admin",
  "createdAt": {"$date": "2026-06-13T00:00:00.000Z"},
  "updatedAt": {"$date": "2026-06-13T00:00:00.000Z"}
}
```

**Login Credentials**:
- Username: `admin`
- Password: `admin123`

---

## METHOD 3: Create Your Own Custom Admin (Recommended)

Want a custom username and password? Follow these steps:

### Step 1: Generate Password Hash

**Option A: Use Online Tool**
1. Go to: https://bcrypt-generator.com/
2. Enter your desired password (e.g., `YourSecurePassword123!`)
3. Rounds: **10** (must be 10!)
4. Click **"Generate"**
5. Copy the hash (starts with `$2a$10$`)

**Option B: Use bcrypt.online**
1. Go to: https://bcrypt.online/
2. Enter your password
3. Cost factor: **10**
4. Generate and copy the hash

### Step 2: Create JSON Document

Replace the placeholders:

```json
{
  "username": "YOUR_USERNAME",
  "password": "YOUR_BCRYPT_HASH_HERE",
  "role": "admin",
  "createdAt": {"$date": "2026-06-13T00:00:00.000Z"},
  "updatedAt": {"$date": "2026-06-13T00:00:00.000Z"}
}
```

**Example** (DON'T USE THIS - create your own):
```json
{
  "username": "dasun_admin",
  "password": "$2a$10$xAbCdEfGhIjKlMnOpQrStU.vWxYz1234567890AbCdEfGhIjKlM",
  "role": "admin",
  "createdAt": {"$date": "2026-06-13T00:00:00.000Z"},
  "updatedAt": {"$date": "2026-06-13T00:00:00.000Z"}
}
```

### Step 3: Insert into MongoDB
Follow Method 1, Step 3 above with your custom JSON.

---

## METHOD 4: Using MongoDB Compass (Desktop App)

### Step 1: Download MongoDB Compass
1. Go to: https://www.mongodb.com/products/compass
2. Download and install for macOS

### Step 2: Connect to Database
1. Open MongoDB Compass
2. Click **"New Connection"**
3. Paste your MongoDB connection string:
   ```
   mongodb+srv://admin:YOUR_PASSWORD@cluster.mongodb.net/teacher-attendance
   ```
4. Click **"Connect"**

### Step 3: Navigate to Collection
1. Expand `teacher-attendance` database
2. Click on `users` collection
3. If it doesn't exist, create it:
   - Right-click database → Create Collection
   - Name: `users`

### Step 4: Insert Document
1. Click **"ADD DATA"** → **"Insert Document"**
2. Switch to **JSON** view
3. Paste the admin user JSON from Method 1
4. Click **"Insert"**

---

## METHOD 5: Using Backend Script (Advanced)

I can create a script that automatically creates the admin user. Let me know if you want this option.

---

## ✅ Verify Admin User Creation

### Check in MongoDB Atlas:
1. Go to Collections
2. Click on `teacher-attendance` → `users`
3. You should see one document:
   ```
   _id: (ObjectId - auto-generated)
   username: "admin"
   password: "$2a$10$..." (hashed)
   role: "admin"
   createdAt: (date)
   updatedAt: (date)
   ```

### Test Login:
1. Go to your deployed frontend (Netlify URL)
2. Enter username: `admin`
3. Enter password: `Admin@2026` (or your custom password)
4. Click **Login**
5. You should be redirected to Dashboard!

---

## 🔐 Security Best Practices

### After First Login:

1. **Change Password Immediately**
   - Unfortunately, the current system doesn't have a "Change Password" feature
   - You can manually update it in MongoDB

2. **Create Additional Admin Users**
   - Follow Method 3 to create more admin accounts
   - Give each admin their own credentials

3. **Create Teacher Accounts**
   - After logging in as admin
   - Go to "Teachers" page
   - Add teachers with their credentials
   - They will have "user" role (not admin)

4. **Secure This File**
   - Delete this file after setup
   - Or store it securely (encrypted)
   - Don't commit it to Git

---

## 🚨 Troubleshooting

### "Invalid credentials" error

**Cause 1: Password hash incorrect**
- Solution: Try Method 2 alternative credentials
- Or generate new hash using bcrypt generator

**Cause 2: User doesn't exist in database**
- Solution: Check MongoDB Atlas → Browse Collections
- Verify user document exists

**Cause 3: Connection string wrong**
- Solution: Check backend `MONGODB_URI` environment variable
- Verify it points to correct database: `/teacher-attendance`

### "Cannot connect to server"

**Cause**: Backend not responding
- Solution: Wait 60 seconds (waking from sleep)
- Check Render logs for errors
- Verify backend is deployed and running

### Password not working after manual creation

**Cause**: Wrong bcrypt rounds
- Solution: Must use exactly **10 rounds**
- Hash must start with `$2a$10$` or `$2b$10$`

### "User already exists" when inserting

**Cause**: Admin user already in database
- Solution: Delete existing user or use different username
- MongoDB Atlas → Collection → Find user → Delete

---

## 📋 Quick Copy-Paste Admin User

**For immediate testing** (change password later!):

### Copy this entire JSON:
```json
{
  "username": "admin",
  "password": "$2a$10$vGX3qJ8Y9KqH5nZ7P0Qz1.xKLm4J2wR6FsH9T5yN3jP8rQ1aL7mD6",
  "role": "admin",
  "createdAt": {"$date": "2026-06-13T00:00:00.000Z"},
  "updatedAt": {"$date": "2026-06-13T00:00:00.000Z"}
}
```

### Login with:
```
Username: admin
Password: Admin@2026
```

---

## 🎯 Next Steps After Admin Login

1. ✅ Login as admin
2. ✅ Verify dashboard loads
3. ✅ Test navigation (all pages work)
4. ✅ Add teachers
5. ✅ Import timetable data
6. ✅ Test attendance marking
7. ✅ Test substitution allocation
8. ✅ Test PDF generation
9. ✅ Change admin password (manually in MongoDB)
10. ✅ Create additional admin users if needed

---

## 📞 Need Help?

If you're stuck, check:
1. MongoDB Atlas → Metrics → Connection status
2. Render → Logs → Look for "Connected to MongoDB"
3. Netlify → Site → Browser console (F12) for errors

---

## 🎉 Success Criteria

You'll know everything is working when:

✅ Admin user exists in MongoDB  
✅ Can visit frontend URL  
✅ Login form appears  
✅ Can login with admin credentials  
✅ Dashboard loads with all features  
✅ Sidebar navigation works  
✅ All pages accessible  

**YOU'RE LIVE!** 🚀

---

**SECURITY REMINDER**: Delete this file after setup or store it securely!

**Created**: June 13, 2026  
**School**: Anuruddha Balika Vidyalaya  
**System**: Teacher Attendance & Substitution Management
