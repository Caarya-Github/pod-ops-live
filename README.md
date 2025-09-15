# Caarya Live - OTP Authentication System

This Next.js project includes a complete OTP (One-Time Password) authentication system copied from the core-admin project, featuring Firebase phone authentication with reCAPTCHA verification.

## 🚀 Features

- **Firebase Phone Authentication**: Secure OTP delivery via SMS
- **reCAPTCHA Integration**: Prevents spam and bot attacks
- **User Authorization**: Backend API integration for user verification
- **Responsive UI**: Modern glassmorphism design with dark theme support
- **Loading States**: Professional UX with animated loading indicators
- **Error Handling**: Comprehensive error messages and validation
- **TypeScript Support**: Full type safety throughout the application

## 📁 Project Structure

```
src/
├── app/
│   ├── login/page.tsx          # Login page with OTP form
│   ├── dashboard/page.tsx      # Protected dashboard page
│   └── page.tsx               # Home page
├── components/
│   ├── LoginForm.tsx          # Main OTP authentication component
│   ├── BouncingDots.tsx       # Loading animation component
│   ├── OTPInput.tsx           # Custom OTP input component
│   └── ui/
│       └── input-otp.tsx      # Shadcn-style OTP input component
└── lib/
    ├── firebase.ts            # Firebase configuration
    └── utils.ts               # Utility functions
```

## 🛠️ Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Firebase and API configuration:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

   # API Configuration
   NEXT_PUBLIC_API_URL=https://your-api-endpoint.com
   ```

3. **Firebase Setup**
   
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication > Phone authentication
   - Configure your domain for authorized domains
   - Set up reCAPTCHA (automatically handled by Firebase)

4. **Backend API Requirements**
   
   Your backend needs to provide this endpoint:
   ```
   GET /admin/allowed-users/{phoneNumber}/check
   ```
   
   Expected response format:
   ```json
   {
     "success": true,
     "data": {
       "exists": true,
       "token": "jwt_token_here"
     }
   }
   ```

## 🚀 Running the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

Visit `http://localhost:3000/login` to access the OTP login form.

## 🔐 How OTP Authentication Works

1. **Phone Number Entry**: User enters their 10-digit phone number
2. **Backend Verification**: System checks if the phone number is authorized
3. **reCAPTCHA Verification**: Invisible reCAPTCHA prevents spam
4. **OTP Delivery**: Firebase sends SMS with 6-digit verification code
5. **OTP Verification**: User enters the code to complete authentication
6. **Redirect**: Successful login redirects to dashboard

## 🎨 UI Components

### LoginForm
The main authentication component featuring:
- Two-step phone number and OTP verification
- Professional glassmorphism design
- Loading states with animated dots
- Comprehensive error handling
- Responsive layout

### Input Components
- **InputOTP**: Shadcn-style OTP input with advanced styling
- **OTPInput**: Custom implementation with paste support
- **BouncingDots**: Smooth loading animation

## 🔧 Customization

### Styling
- Update colors in the LoginForm component
- Modify the logo placeholder in LoginForm.tsx
- Adjust theme variables and CSS classes

### API Integration
- Update the `API_URL` environment variable
- Modify the authorization endpoint in LoginForm.tsx
- Customize the user verification logic

### Firebase Configuration
- Update Firebase project settings
- Modify authentication providers if needed
- Configure additional security rules

## 📱 Browser Support

- Modern browsers with ES6+ support
- Mobile-responsive design
- iOS Safari and Android Chrome tested

## 🔒 Security Features

- **reCAPTCHA Integration**: Prevents automated attacks
- **Phone Number Validation**: Ensures proper format
- **Backend Authorization**: Verifies user permissions
- **Token-based Authentication**: Secure session management
- **HTTPS Required**: Firebase Auth requires secure connections

## 🐛 Troubleshooting

### Common Issues

1. **reCAPTCHA Not Working**
   - Ensure domain is added to Firebase authorized domains
   - Check that the site key is correct
   - Verify HTTPS is being used in production

2. **SMS Not Received**
   - Check Firebase phone authentication configuration
   - Verify phone number format (+91 for India)
   - Ensure Firebase project has sufficient quotas

3. **Build Errors**
   - Verify all environment variables are set
   - Check that all dependencies are installed
   - Ensure TypeScript types are correct

### Environment Variables
Make sure all required environment variables are configured in `.env.local` for development and in your deployment platform for production.

## 📄 License

This project contains code adapted from the core-admin project. Please ensure compliance with your organization's licensing requirements.