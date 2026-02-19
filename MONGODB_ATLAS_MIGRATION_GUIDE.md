# MongoDB Atlas Migration Guide

## Quick Setup Summary

### 1. MongoDB Atlas Setup (5 minutes)
1. Create account at https://www.mongodb.com/cloud/atlas/register
2. Create FREE M0 cluster
3. Create database user with password
4. Whitelist IP: 0.0.0.0/0 (allow all)
5. Get connection string

### 2. Update .env File
Replace the placeholders in `backend/.env`:
```
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/ecommerce?retryWrites=true&w=majority
```

**Example:**
```
MONGODB_URI=mongodb+srv://ecommerce_user:SecurePass123@cluster0.abc123.mongodb.net/ecommerce?retryWrites=true&w=majority
```

### 3. Test Connection
```bash
cd backend
node scripts/testMongoConnection.js
```

## Data Migration (If You Have Local Data)

### Option 1: Export/Import with MongoDB Tools

#### Export from Local MongoDB
```bash
# Export all collections
mongodump --uri="mongodb://localhost:27017/ecommerce" --out=./backup

# Or export specific collection
mongoexport --uri="mongodb://localhost:27017/ecommerce" --collection=products --out=products.json
```

#### Import to MongoDB Atlas
```bash
# Import all collections
mongorestore --uri="mongodb+srv://username:password@cluster.mongodb.net/ecommerce" ./backup/ecommerce

# Or import specific collection
mongoimport --uri="mongodb+srv://username:password@cluster.mongodb.net/ecommerce" --collection=products --file=products.json
```

### Option 2: Use MongoDB Compass (GUI Tool)

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect to local database: `mongodb://localhost:27017`
3. Export collections as JSON
4. Connect to Atlas: `mongodb+srv://username:password@cluster.mongodb.net`
5. Import JSON files

### Option 3: Re-seed Database

If you're using seed scripts, just run them again:
```bash
cd backend
node scripts/seedProducts.js
node scripts/createDefaultAdmin.js
# etc.
```

## Troubleshooting

### Connection Timeout
- **Issue**: Connection times out
- **Solution**: Check Network Access in Atlas, ensure 0.0.0.0/0 is whitelisted

### Authentication Failed
- **Issue**: "Authentication failed"
- **Solution**: 
  - Verify username and password are correct
  - Check for special characters in password (URL encode them)
  - Example: `@` becomes `%40`, `#` becomes `%23`

### DNS Resolution Error
- **Issue**: "getaddrinfo ENOTFOUND"
- **Solution**: 
  - Check internet connection
  - Verify cluster URL is correct
  - Wait 5-10 minutes if cluster was just created

### Special Characters in Password
If your password has special characters, URL encode them:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `^` → `%5E`
- `&` → `%26`

Example:
```
Password: MyPass@123#
Encoded: MyPass%40123%23
```

## Benefits of MongoDB Atlas

✅ **Free tier**: 512 MB storage, perfect for development
✅ **Always online**: No need to run local MongoDB
✅ **Automatic backups**: Data is safe
✅ **Global access**: Access from anywhere
✅ **Scalable**: Easy to upgrade when needed
✅ **Monitoring**: Built-in performance monitoring

## Production Considerations

When deploying to production:

1. **Whitelist specific IPs** instead of 0.0.0.0/0
2. **Use strong passwords** (20+ characters)
3. **Enable backup** (automatic in paid tiers)
4. **Set up monitoring** and alerts
5. **Use environment variables** for connection string
6. **Consider upgrading** to M10+ for production workloads

## Connection String Format

```
mongodb+srv://<username>:<password>@<cluster-url>.mongodb.net/<database>?retryWrites=true&w=majority
```

**Parts:**
- `<username>`: Database user (not Atlas account email)
- `<password>`: Database user password (URL encoded)
- `<cluster-url>`: Your cluster URL (e.g., cluster0.abc123)
- `<database>`: Database name (e.g., ecommerce)

## Next Steps

1. ✅ Update `.env` with your Atlas connection string
2. ✅ Run `node scripts/testMongoConnection.js` to verify
3. ✅ Start your backend: `npm run dev`
4. ✅ Your app now uses cloud database!

## Support

- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/
- MongoDB University: https://university.mongodb.com/ (free courses)
- Community Forums: https://www.mongodb.com/community/forums/
