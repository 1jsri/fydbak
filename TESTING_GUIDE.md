# Testing Guide - AI Features

## Quick Test Scenarios

### Scenario 1: Test AI Clarification (Vague Answer)

**Goal**: Verify AI asks for clarification on short/vague answers

**Steps**:
1. Register as manager
2. Create survey: "Daily Check-in"
3. Add question: "How was your experience today?"
4. Publish survey
5. Copy survey link
6. Open in incognito mode
7. Enter name (or skip)
8. Answer: "fine" (or "ok" or "good")
9. **Expected**: AI asks for clarification like "Could you tell me more about that?"
10. Answer clarification with details
11. **Expected**: Moves to next question or completes

**What to verify**:
- ✅ Clarification appears after vague answer
- ✅ Clarification is friendly and conversational
- ✅ Can answer clarification
- ✅ Proceeds after clarification
- ✅ Clarification stored in database

### Scenario 2: Test AI Clarification (Detailed Answer)

**Goal**: Verify AI accepts good answers without clarification

**Steps**:
1. Take same survey
2. Answer: "Today was excellent! I helped a customer find the perfect product and they were very grateful. Made my day."
3. **Expected**: No clarification, moves directly to next question

**What to verify**:
- ✅ No clarification for detailed answer
- ✅ Smooth progression to next question
- ✅ Response saved correctly

### Scenario 3: Test Multiple Clarifications

**Goal**: Verify maximum 2 clarifications per question

**Steps**:
1. Create survey with one question
2. Answer: "ok"
3. Clarify with: "yeah"
4. **Expected**: Second clarification
5. Clarify with: "sure"
6. **Expected**: Accepts and moves on (max 2 reached)

**What to verify**:
- ✅ First clarification appears
- ✅ Second clarification appears
- ✅ Third clarification does NOT appear
- ✅ Proceeds after 2 attempts

### Scenario 4: Test AI Summary Generation

**Goal**: Verify summary generates after completion

**Steps**:
1. Create survey with 3 questions:
   - "What went well this week?"
   - "What challenges did you face?"
   - "What support do you need?"
2. Complete survey with detailed answers
3. As manager, view the response
4. **Expected**: See AI summary at top of response
5. **Expected**: See 2-3 action points
6. **Expected**: See key themes (if any)

**What to verify**:
- ✅ Summary appears in response detail
- ✅ Summary is relevant to answers
- ✅ Action points are actionable
- ✅ Priority levels assigned
- ✅ Full responses still visible below

### Scenario 5: Test Edge Cases

#### Empty/Short Survey
1. Create survey with 1 question
2. Answer with good detail
3. **Expected**: Summary still generates

#### All Skipped Questions
1. Try to skip all questions (if skip feature available)
2. **Expected**: Summary handles gracefully

#### Long Answers
1. Answer with 200+ word response
2. **Expected**: No clarification needed
3. **Expected**: Summary captures key points

#### Special Characters
1. Answer with emojis, punctuation, etc.
2. **Expected**: System handles without errors

### Scenario 6: Test Performance

**Goal**: Verify system is responsive

**Steps**:
1. Submit answer
2. **Expected**: Answer appears immediately
3. **Expected**: Clarification appears within 1-2 seconds
4. Complete survey
5. **Expected**: Completion message immediate
6. **Expected**: Summary generates in background (2-3 seconds)

**What to verify**:
- ✅ No delays in UI
- ✅ Loading states show appropriately
- ✅ Summary doesn't block completion

### Scenario 7: Test Error Handling

**Goal**: Verify graceful degradation

**Steps**:
1. Complete survey normally
2. Check browser console for errors
3. If edge function fails, should fall back to rule-based

**What to verify**:
- ✅ No JavaScript errors
- ✅ System works even if AI unavailable
- ✅ User experience unaffected by backend issues

## Automated Testing Checklist

### Database
- [ ] Clarifications table receiving data
- [ ] Response clarification_count updating
- [ ] Session summaries creating correctly
- [ ] All foreign keys working

### Edge Functions
- [ ] analyze-response is ACTIVE
- [ ] generate-summary is ACTIVE
- [ ] CORS headers working
- [ ] Authentication not blocking anonymous

### UI/UX
- [ ] Messages appear in correct order
- [ ] Clarifications visually distinct
- [ ] Loading states smooth
- [ ] Mobile responsive
- [ ] Keyboard navigation works

### Manager View
- [ ] Summary displays correctly
- [ ] Action points formatted nicely
- [ ] Full responses expandable
- [ ] Clarifications shown properly

## Test Data Examples

### Good Answers (No Clarification Needed)
- "This week I successfully closed 3 deals with new customers. One particularly memorable interaction was with a client who had complex requirements, and I was able to customize a solution that exceeded their expectations."
- "I faced a challenge with our inventory system going down on Tuesday. It took about 4 hours to resolve, and I had to manually track orders during that time."
- "I need better access to product training materials. Specifically, video tutorials would help me explain features to customers more effectively."

### Vague Answers (Should Trigger Clarification)
- "fine"
- "ok"
- "good"
- "nothing"
- "idk"
- "not much"
- "it was ok I guess"

### Borderline Answers (May or May Not Clarify)
- "Pretty good actually"
- "Had some issues"
- "Could be better"
- "Went well mostly"

## Expected AI Behaviors

### Rule-Based Clarification Triggers
- Answer < 5 words → Always clarify
- Contains vague phrase + < 15 words → Clarify
- < 20 words and no examples → Clarify
- Otherwise → Accept

### Summary Generation
- Analyzes all responses together
- Detects sentiment (positive/negative/neutral)
- Identifies keywords and themes
- Generates 2-3 sentences
- Creates 2-3 prioritized actions
- Calculates honesty score (internal)

## Troubleshooting Tests

### If clarifications don't appear
1. Check: Is answer actually vague?
2. Check: Browser console for errors
3. Check: Network tab for API call
4. Verify: Edge function deployed
5. Test: Call edge function directly

### If summaries don't generate
1. Wait 5 seconds, refresh page
2. Check: Session status is "completed"
3. Verify: generate-summary function active
4. Check: Browser network tab
5. Look: Database session_summaries table

### If build fails
1. Run: `npm install`
2. Run: `npm run typecheck`
3. Check: All imports correct
4. Verify: No syntax errors

## Success Criteria

After testing, you should see:

✅ **Clarification System**
- Vague answers get follow-ups
- Detailed answers accepted
- Max 2 clarifications enforced
- Smooth conversation flow

✅ **Summary System**
- Summaries appear for all completed surveys
- Summaries are relevant and useful
- Action points are actionable
- Manager sees full context

✅ **User Experience**
- No errors or broken states
- Fast and responsive
- Works on mobile
- Intuitive for both managers and reps

✅ **Data Integrity**
- All responses saved
- Clarifications linked correctly
- Summaries properly associated
- No data loss

## Next Steps After Testing

1. **Gather feedback** from real users
2. **Monitor** clarification quality
3. **Tune** prompts if needed
4. **Consider** adding OpenAI for better AI
5. **Document** any issues found
6. **Iterate** based on usage patterns

## Need Help?

- See `WHATS_NEW.md` for feature overview
- See `AI_INTEGRATION_EXAMPLE.md` for AI setup
- See `IMPLEMENTATION_GUIDE.md` for architecture
- Check browser console for detailed errors
- Review edge function logs in Supabase dashboard

---

**Happy Testing! 🧪**

The AI features are designed to work out of the box with intelligent rule-based logic. Test thoroughly to ensure everything works as expected before rolling out to real users.
