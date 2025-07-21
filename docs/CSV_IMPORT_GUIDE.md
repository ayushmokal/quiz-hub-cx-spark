# CSV Import Guide

## Overview
The Quiz Hub CX Spark platform supports bulk import of quiz questions via CSV files. This feature allows administrators to quickly populate the quiz database with large sets of questions.

## CSV File Format

### Required Columns
Your CSV file must include these columns in this exact order:

| Column | Description | Example |
|--------|-------------|---------|
| `question` | The quiz question text | "What is the weight of the smallest Ultrahuman Ring AIR?" |
| `option_a` | First answer option | "1.5 grams" |
| `option_b` | Second answer option | "2.4 grams" |
| `option_c` | Third answer option | "3.2 grams" |
| `option_d` | Fourth answer option | "4.1 grams" |
| `correct_answer` | The correct answer (must match one of the options) | "2.4 grams" |
| `explanation` | Explanation for the correct answer | "The Ultrahuman Ring AIR weighs between 2.4-3.6 grams..." |
| `topic` | Topic name (must exist in database) | "Ring Knowledge" |
| `category` | Category name (must exist in database) | "ultrahuman-training" |
| `difficulty` | Question difficulty level | "Easy", "Medium", or "Hard" |

### Sample CSV Format
```csv
question,option_a,option_b,option_c,option_d,correct_answer,explanation,topic,category,difficulty
"What is the weight of the smallest Ultrahuman Ring AIR?","1.5 grams","2.4 grams","3.2 grams","4.1 grams","2.4 grams","The Ultrahuman Ring AIR weighs between 2.4-3.6 grams, with the smallest size being 2.4 grams.","Ring Knowledge","ultrahuman-training","Easy"
```

## Prerequisites

### 1. Categories and Topics Must Exist
Before importing questions, ensure that:
- **Categories** referenced in your CSV already exist in the system
- **Topics** referenced in your CSV already exist and are properly linked to their categories

### 2. Check Existing Categories and Topics
1. Navigate to **Categories** page to view existing categories
2. Navigate to **Topics** page to view existing topics
3. Note the exact names (case-sensitive) for use in your CSV

## Import Process

### Step 1: Prepare Your CSV File
1. Create or edit your CSV file with the required columns
2. Ensure all questions have unique content
3. Verify that category and topic names match exactly what exists in the database
4. Use proper CSV formatting with quoted fields containing commas

### Step 2: Access Import Feature
1. Log in as an administrator
2. Navigate to **Import Quizzes** from the admin sidebar
3. You'll see the bulk quiz import interface

### Step 3: Upload and Validate
1. Click **"Choose File"** and select your CSV file
2. Click **"Parse & Preview"** to validate the file
3. Review the preview table to ensure data is parsed correctly
4. Check for any validation errors in the results

### Step 4: Import Questions
1. If validation passes, click **"Import Questions"**
2. Monitor the import progress
3. Review the import results for success/failure counts

## Troubleshooting

### Common Issues and Solutions

#### ❌ "Category does not exist" Error
**Problem:** The category name in your CSV doesn't match any existing category.

**Solution:**
1. Go to Categories page and check exact category names
2. Update your CSV to use the exact category name (case-sensitive)
3. Or create the missing category in the system first

#### ❌ "Topic does not exist" Error
**Problem:** The topic name in your CSV doesn't match any existing topic.

**Solution:**
1. Go to Topics page and check exact topic names
2. Update your CSV to use the exact topic name (case-sensitive)
3. Or create the missing topic in the system first

#### ❌ Parsing Errors
**Problem:** CSV file format is incorrect or contains invalid data.

**Solutions:**
- Ensure all required columns are present
- Check that quoted fields are properly formatted
- Verify no duplicate header rows exist
- Remove any empty rows or invalid characters

#### ❌ Validation Fails After Creating Topics/Categories
**Problem:** Newly created categories/topics not recognized during import.

**Solution:**
1. Click the **"Refresh Topics"** button on the Import page
2. This reloads the latest categories and topics from the database
3. Try the import again

### Debug Mode
The import system includes debug logging. To view detailed validation information:
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Attempt the import
4. Review debug output showing available vs. required categories/topics

## Best Practices

### File Preparation
- **Use proper CSV formatting** with quoted fields for text containing commas
- **Keep file sizes manageable** (recommended: under 1000 questions per import)
- **Test with small batches** before importing large datasets
- **Backup your database** before large imports

### Content Guidelines
- **Write clear, unambiguous questions**
- **Ensure all four answer options are plausible**
- **Provide helpful explanations** for learning purposes
- **Use consistent difficulty ratings**

### Category and Topic Organization
- **Create logical category hierarchies** before importing
- **Use descriptive topic names** that clearly indicate content area
- **Group related questions** under appropriate topics

## Example Files

### Simple Import Example
See `quiz-data/simple-ultrahuman-quiz.csv` for a working example with 15 questions about Ultrahuman Ring products.

### Multiple Category Example
For importing questions across multiple categories, ensure each category-topic combination exists:

```csv
question,option_a,option_b,option_c,option_d,correct_answer,explanation,topic,category,difficulty
"Ring question 1","A","B","C","D","A","Explanation","Ring Knowledge","ultrahuman-training","Easy"
"App question 1","A","B","C","D","B","Explanation","App Features","ultrahuman-training","Medium"
"CX question 1","A","B","C","D","C","Explanation","Customer Service","cx-fundamentals","Hard"
```

## Success Metrics
After a successful import, you should see:
- ✅ All questions imported without errors
- ✅ Questions appear in the Questions management page
- ✅ Questions are properly categorized and linked to topics
- ✅ Questions are available for quiz attempts

## Support
If you encounter issues not covered in this guide:
1. Check the browser console for detailed error messages
2. Verify your CSV format matches the requirements exactly
3. Ensure all prerequisites (categories/topics) are properly set up
4. Use the "Refresh Topics" button to reload the latest database state

---

**Last Updated:** January 2025
**Version:** 1.0.0
