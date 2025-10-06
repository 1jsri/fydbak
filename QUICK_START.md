# Motiiv - Quick Start Guide

## 🚀 5-Minute Setup

### 1. Access the Application

The application is already running! Open your browser to see it live.

### 2. Create Your First Manager Account

1. Click **"Get Started"** or **"Sign Up"**
2. Enter:
   - Full Name
   - Email
   - Password (min 6 characters)
3. Click **"Create Account"**

You'll be automatically logged in and redirected to the dashboard.

### 3. Create Your First Survey

1. Click **"Create Survey"** or **"New Survey"** button
2. Fill in the details:
   - **Emoji**: Choose an optional emoji (or skip)
   - **Title**: e.g., "Weekly Team Check-in"
   - **Description**: e.g., "Share your thoughts on this week"
   - **Goal**: Select from dropdown (e.g., "Team Morale")
3. Add questions:
   - **Question 1**: "What went well this week?"
   - **Question 2**: "What challenges did you face?"
   - **Question 3**: "What support do you need?"
4. Click **"Publish Survey"**

### 4. Share Your Survey

On the survey detail page:
1. See your survey link: `https://your-domain/s/ABC123`
2. Click **"Copy Link"** to copy to clipboard
3. Share via:
   - Email to your team
   - Slack message
   - Text message
   - Any communication tool

### 5. Test Taking the Survey

1. Open the survey link in a **new incognito/private window**
2. Enter your name or leave blank for anonymous
3. Click **"Start Survey"**
4. Answer each question in the chat
5. Click send or press Enter
6. Complete all questions
7. See the "Thank You" confirmation

### 6. View Responses

1. Go back to your manager dashboard
2. Click on your survey
3. See statistics:
   - Total responses
   - Completed responses
   - Completion rate
4. Click on a response to view full details

## 🎯 Complete User Journey

### As a Manager

```
Register → Dashboard → Create Survey → Publish → Share Link → View Responses
```

### As a Rep (Team Member)

```
Click Link → Enter Name → Answer Questions → Complete → Done
```

## 📱 Try on Mobile

1. Open the survey link on your phone
2. Notice the mobile-optimized interface
3. Complete the survey with touch-friendly buttons

## ⚡ Key Features to Try

### Manager Features
- Create multiple surveys
- Filter surveys by status (Active, Draft, Archived)
- Archive a survey to stop collecting responses
- View response details with timestamps
- Copy survey links easily

### Rep Features
- Anonymous responses (skip name entry)
- Chat-based experience (not a form!)
- Progress tracking
- Auto-save (refresh the page mid-survey, it saves!)
- Mobile responsive

## 🎨 Customization Options

When creating surveys, you can:
- Choose from 8 emoji options
- Select from 6 goal categories
- Add unlimited questions
- Reorder questions (drag and drop ready)
- Save as draft to finish later

## 🔐 Privacy Features

- Reps can submit anonymously
- No email required from reps
- Secure authentication for managers
- Data encrypted in transit and at rest
- Row-level security in database

## 📊 What's Working Right Now

✅ Full manager authentication
✅ Survey creation and management
✅ Conversational survey taking
✅ Response viewing
✅ Real-time statistics
✅ Mobile responsive design
✅ Session auto-save
✅ Anonymous submissions

## 🔧 What Needs AI Integration

The following features are built but need AI connection:
- Automatic follow-up questions (when answer is vague)
- AI-generated summaries
- Suggested action points
- Response quality scoring

See `AI_INTEGRATION_EXAMPLE.md` for implementation details.

## 🎓 Sample Survey Ideas

### For Retail Teams
- "Daily Store Experience"
  - What customer feedback did you receive today?
  - What inventory issues did you notice?
  - What can we improve?

### For Field Teams
- "Weekly Field Report"
  - Describe your most challenging client interaction
  - What resources would help you succeed?
  - What wins should we celebrate?

### For Remote Teams
- "Monthly Team Pulse"
  - How connected do you feel to the team?
  - What's blocking your productivity?
  - What's one thing that would improve your work?

## 💡 Tips for Best Results

1. **Keep questions open-ended** - "How?" and "What?" work better than yes/no
2. **Ask for specifics** - "Give an example" encourages detail
3. **Make it conversational** - Write questions like you're chatting
4. **Limit to 3-5 questions** - Higher completion rates
5. **Be clear about purpose** - Explain why you're asking in the description

## 🐛 Troubleshooting

### Can't log in?
- Check your email/password
- Try password reset
- Ensure you registered first

### Survey link not working?
- Check the survey status is "Active"
- Try the short code at `/s/CODE`
- Make sure you copied the full link

### Responses not showing?
- Refresh the survey detail page
- Check the session was completed (not abandoned)
- Verify you're viewing the correct survey

### Build errors?
```bash
npm install  # Reinstall dependencies
npm run build  # Try building again
```

## 📚 Next Steps

1. ✅ **Test the MVP** - Create surveys and collect real feedback
2. 🔧 **Add AI** - Follow AI_INTEGRATION_EXAMPLE.md
3. 📈 **Gather feedback** - Use your own product!
4. 🚀 **Launch publicly** - Add billing and go live

## 🤝 Need Help?

- Check `README.md` for detailed documentation
- See `IMPLEMENTATION_GUIDE.md` for technical details
- Review `PROJECT_SUMMARY.md` for complete overview
- Read `FEATURES_CHECKLIST.md` for feature status

## 🎉 You're All Set!

You now have a fully functional conversational survey platform. Start gathering honest feedback from your team today!

The hardest parts are done:
- ✅ Database designed and deployed
- ✅ Authentication working
- ✅ UI built and responsive
- ✅ Core user flows complete

Just add AI integration and you're ready to launch! 🚀
