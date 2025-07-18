-- Seed data for CX Quiz Hub

-- Insert users from the provided email list
INSERT INTO users (email, name, role, department) VALUES
-- Admin users
('admin@ultrahuman.com', 'System Admin', 'admin', 'Operations'),
('adi@ultrahuman.com', 'Adi ', 'admin', 'Leadership'),

-- Coach users (senior team members)
('jaideep@ultrahuman.com', 'Jaideep Singh', 'coach', 'Customer Experience'),
('munish@ultrahuman.com', 'Munish Kumar', 'coach', 'Technical Support'),

-- Agent users (all other team members)
('abdullah.abdullateef@ultrahuman.com', 'Abdullah Abdullateef', 'agent', 'Customer Support'),
('abhimanyu.singh@ultrahuman.com', 'Abhimanyu Singh', 'agent', 'Customer Support'),
('abhishek.yadav@ultrahuman.com', 'Abhishek Yadav', 'agent', 'Technical Support'),
('aditya.ranjan@ultrahuman.com', 'Aditya Ranjan', 'agent', 'Customer Support'),
('aikanshi@ultrahuman.com', 'Aikanshi Sharma', 'agent', 'Customer Support'),
('akash.garg@ultrahuman.com', 'Akash Garg', 'agent', 'Technical Support'),
('amal.robin@ultrahuman.com', 'Amal Robin', 'agent', 'Customer Support'),
('aman.katiyar@ultrahuman.com', 'Aman Katiyar', 'agent', 'Customer Support'),
('ankit.bhandari@ultrahuman.com', 'Ankit Bhandari', 'agent', 'Technical Support'),
('ankush.pr@ultrahuman.com', 'Ankush PR', 'agent', 'Customer Support'),
('aryan.das@ultrahuman.com', 'Aryan Das', 'agent', 'Customer Support'),
('ashad@ultrahuman.com', 'Ashad Khan', 'agent', 'Customer Support'),
('asma.sultana@ultrahuman.com', 'Asma Sultana', 'agent', 'Customer Support'),
('avishi.gupta@ultrahuman.com', 'Avishi Gupta', 'agent', 'Customer Support'),
('ayush.jangid@ultrahuman.com', 'Ayush Jangid', 'agent', 'Technical Support'),
('ayush.mokal@ultrahuman.com', 'Ayush Mokal', 'agent', 'Customer Support'),
('banveen@ultrahuman.com', 'Banveen Singh', 'agent', 'Customer Support'),
('bhawna.choudhary@ultrahuman.com', 'Bhawna Choudhary', 'agent', 'Customer Support'),
('diksha.sagar@ultrahuman.com', 'Diksha Sagar', 'agent', 'Customer Support'),
('divya.sharma@ultrahuman.com', 'Divya Sharma', 'agent', 'Customer Support'),
('divyansh.mishra@ultrahuman.com', 'Divyansh Mishra', 'agent', 'Technical Support'),
('fatema@ultrahuman.com', 'Fatema Khan', 'agent', 'Customer Support'),
('fatima.gauhar@ultrahuman.com', 'Fatima Gauhar', 'agent', 'Customer Support'),
('gaurav.malik@ultrahuman.com', 'Gaurav Malik', 'agent', 'Technical Support'),
('govind.kumar@ultrahuman.com', 'Govind Kumar', 'agent', 'Customer Support'),
('ahmad.haris@ultrahuman.com', 'Ahmad Haris', 'agent', 'Customer Support'),
('ishita.dutta@ultrahuman.com', 'Ishita Dutta', 'agent', 'Customer Support'),
('ketki.hiwarkar@ultrahuman.com', 'Ketki Hiwarkar', 'agent', 'Customer Support'),
('loknath.r@ultrahuman.com', 'Loknath R', 'agent', 'Technical Support'),
('mahyur.chandarey@ultrahuman.com', 'Mahyur Chandarey', 'agent', 'Customer Support'),
('manasa.manjunath@ultrahuman.com', 'Manasa Manjunath', 'agent', 'Customer Support'),
('meghna@ultrahuman.com', 'Meghna Sharma', 'agent', 'Customer Support'),
('mehar.kashyap@ultrahuman.com', 'Mehar Kashyap', 'agent', 'Customer Support'),
('nikhil.matam@ultrahuman.com', 'Nikhil Matam', 'agent', 'Technical Support'),
('nimisa.bora@ultrahuman.com', 'Nimisa Bora', 'agent', 'Customer Support'),
('nitasha.sharma@ultrahuman.com', 'Nitasha Sharma', 'agent', 'Customer Support'),
('numan@ultrahuman.com', 'Numan Ali', 'agent', 'Customer Support'),
('parleen.saund@ultrahuman.com', 'Parleen Saund', 'agent', 'Customer Support'),
('parth.saluja@ultrahuman.com', 'Parth Saluja', 'agent', 'Technical Support'),
('payal.pamnani@ultrahuman.com', 'Payal Pamnani', 'agent', 'Customer Support'),
('prateek.govila@ultrahuman.com', 'Prateek Govila', 'agent', 'Technical Support'),
('pratiksha.pagare@ultrahuman.com', 'Pratiksha Pagare', 'agent', 'Customer Support'),
('riya.radhakrishnan@ultrahuman.com', 'Riya Radhakrishnan', 'agent', 'Customer Support'),
('saloni.jain@ultrahuman.com', 'Saloni Jain', 'agent', 'Customer Support'),
('sandeep.manda@ultrahuman.com', 'Sandeep Manda', 'agent', 'Technical Support'),
('sanil.sharma@ultrahuman.com', 'Sanil Sharma', 'agent', 'Customer Support'),
('shalm@ultrahuman.com', 'Shalm Kumar', 'agent', 'Customer Support'),
('sunny@ultrahuman.com', 'Sunny Singh', 'agent', 'Customer Support'),
('sharmistha.palui@ultrahuman.com', 'Sharmistha Palui', 'agent', 'Customer Support'),
('shrushti@ultrahuman.com', 'Shrushti Patel', 'agent', 'Customer Support'),
('sonia.singh@ultrahuman.com', 'Sonia Singh', 'agent', 'Customer Support'),
('sreeza@ultrahuman.com', 'Sreeza Nair', 'agent', 'Customer Support'),
('surabhi.parapurath@ultrahuman.com', 'Surabhi Parapurath', 'agent', 'Customer Support'),
('sureshma.ck@ultrahuman.com', 'Sureshma CK', 'agent', 'Customer Support'),
('suvira@ultrahuman.com', 'Suvira Sharma', 'agent', 'Customer Support'),
('suyog@ultrahuman.com', 'Suyog Patil', 'agent', 'Technical Support'),
('swapna.mishra@ultrahuman.com', 'Swapna Mishra', 'agent', 'Customer Support'),
('tannu.nongmaithem@ultrahuman.com', 'Tannu Nongmaithem', 'agent', 'Customer Support'),
('trishala@ultrahuman.com', 'Trishala Gupta', 'agent', 'Customer Support'),
('tsering@ultrahuman.com', 'Tsering Dolma', 'agent', 'Customer Support'),
('twinkle@ultrahuman.com', 'Twinkle Sharma', 'agent', 'Customer Support'),
('vaibhav.verma@ultrahuman.com', 'Vaibhav Verma', 'agent', 'Technical Support'),
('vinayak.ray@ultrahuman.com', 'Vinayak Ray', 'agent', 'Customer Support'),
('vishal.misal@ultrahuman.com', 'Vishal Misal', 'agent', 'Technical Support'),
('vishnu.balesh@ultrahuman.com', 'Vishnu Balesh', 'agent', 'Customer Support'),
('yohaan.dhanowa@ultrahuman.com', 'Yohaan Dhanowa', 'agent', 'Customer Support');

-- Insert topics
INSERT INTO topics (display_name, slug, description, category) VALUES
('Sensor Troubleshooting', 'sensor-troubleshooting', 'Learn to diagnose and resolve common sensor connectivity and accuracy issues', 'sensor'),
('Ring Device Support', 'ring-device-support', 'Comprehensive guide to Ring device features, troubleshooting, and user guidance', 'ring'),
('Payment Processing', 'payment-processing', 'Handle payment failures, refunds, and billing inquiries effectively', 'payment'),
('Logistics & Shipping', 'logistics-shipping', 'Manage shipping delays, tracking issues, and delivery complications', 'logistics'),
('Account Management', 'account-management', 'User account setup, data management, and privacy settings', 'account');

-- Get topic IDs for question insertion
DO $$
DECLARE
    sensor_topic_id UUID;
    ring_topic_id UUID;
    payment_topic_id UUID;
    logistics_topic_id UUID;
    account_topic_id UUID;
BEGIN
    SELECT id INTO sensor_topic_id FROM topics WHERE slug = 'sensor-troubleshooting';
    SELECT id INTO ring_topic_id FROM topics WHERE slug = 'ring-device-support';
    SELECT id INTO payment_topic_id FROM topics WHERE slug = 'payment-processing';
    SELECT id INTO logistics_topic_id FROM topics WHERE slug = 'logistics-shipping';
    SELECT id INTO account_topic_id FROM topics WHERE slug = 'account-management';

    -- Insert sample questions for Sensor Troubleshooting
    INSERT INTO questions (topic_id, type, content, options, correct_answers, explanation, difficulty, time_limit) VALUES
    (sensor_topic_id, 'multiple-choice', 'A customer reports their Ring is not tracking sleep data. What is the first troubleshooting step?', 
     '["Reset the device to factory settings", "Check if the Ring is worn snugly on the finger", "Update the mobile app", "Contact technical support immediately"]',
     '{1}', 'Proper Ring placement is crucial for accurate sleep tracking. The Ring should be worn snugly but comfortably on the finger.', 'beginner', 30),
    
    (sensor_topic_id, 'multi-select', 'Which factors can affect sensor accuracy? (Select all that apply)', 
     '["Device placement", "Skin moisture", "Environmental temperature", "User age", "Battery level"]',
     '{0,1,2,4}', 'Device placement, skin moisture, environmental temperature, and battery level all directly impact sensor accuracy. User age is not a significant factor.', 'intermediate', 45),
    
    (sensor_topic_id, 'multiple-choice', 'What should you do if a customer reports consistently low HRV readings?', 
     '["Tell them HRV is naturally low", "Check their Ring fit and placement", "Suggest they see a doctor", "Reset their device"]',
     '{1}', 'Ring fit and placement are the most common causes of inaccurate HRV readings. Always check these basics first.', 'intermediate', 40),

    -- Insert sample questions for Ring Device Support
    (ring_topic_id, 'multiple-choice', 'What is the recommended charging frequency for the Ultrahuman Ring?', 
     '["Daily", "Every 2-3 days", "Weekly", "Every 4-7 days"]',
     '{3}', 'The Ultrahuman Ring typically lasts 4-7 days on a single charge, depending on usage patterns.', 'beginner', 30),
    
    (ring_topic_id, 'multiple-choice', 'If a customer''s Ring is not syncing with the app, what is the first step?', 
     '["Factory reset the Ring", "Check Bluetooth connection", "Reinstall the app", "Contact support"]',
     '{1}', 'Bluetooth connectivity issues are the most common cause of syncing problems. Always check this first.', 'beginner', 25),
    
    (ring_topic_id, 'case-study', 'Case Study: A customer purchased a Ring 3 months ago and wants to return it due to "inaccurate readings." They have not contacted support before and seem frustrated. They mention the Ring feels loose and they often forget to wear it. How would you handle this situation?', 
     '["Immediately process a full refund", "Educate about proper wear and offer to troubleshoot first", "Offer a replacement device", "Escalate to technical team"]',
     '{1}', 'The customer''s issues (loose fit, inconsistent wear) suggest user education could resolve the problem. Address the root cause first before considering returns.', 'advanced', 90),

    -- Insert sample questions for Payment Processing
    (payment_topic_id, 'multiple-choice', 'A customer''s payment failed during checkout. What information should you collect first?', 
     '["Their credit card number", "Error message displayed", "Their billing address", "When they last made a purchase"]',
     '{1}', 'The error message provides the most specific information about what went wrong with the payment.', 'beginner', 35),
    
    (payment_topic_id, 'multi-select', 'Which of these are valid reasons for payment failure? (Select all that apply)', 
     '["Insufficient funds", "Expired card", "Incorrect CVV", "Wrong billing address", "All of the above"]',
     '{0,1,2,3}', 'All of these are common reasons for payment failures. Each requires a different resolution approach.', 'intermediate', 40),

    -- Insert sample questions for Logistics & Shipping
    (logistics_topic_id, 'multiple-choice', 'A customer hasn''t received their Ring after 10 business days. What should you do first?', 
     '["Immediately send a replacement", "Check the tracking information", "Offer a refund", "Tell them to wait longer"]',
     '{1}', 'Always check tracking information first to understand where the package is and what might have happened.', 'beginner', 30),
    
    (logistics_topic_id, 'multiple-choice', 'If a package shows as "delivered" but the customer didn''t receive it, what''s the best next step?', 
     '["Tell them it''s not our problem", "Check with neighbors or building management", "Immediately send replacement", "File insurance claim"]',
     '{1}', 'Many packages are left with neighbors or building management. This is often the quickest resolution.', 'intermediate', 35),

    -- Insert sample questions for Account Management
    (account_topic_id, 'multiple-choice', 'A customer wants to delete their account and all data. What should you inform them about?', 
     '["They cannot delete their account", "Data deletion is permanent and irreversible", "They can recover data within 30 days", "Only personal data will be deleted"]',
     '{1}', 'It''s crucial to inform customers that data deletion is permanent and cannot be undone to ensure informed consent.', 'intermediate', 45),
    
    (account_topic_id, 'multi-select', 'Which data can customers export from their account? (Select all that apply)', 
     '["Health metrics", "Sleep data", "Activity data", "App usage logs", "Personal information"]',
     '{0,1,2,4}', 'Customers can export their health metrics, sleep data, activity data, and personal information. App usage logs are typically not available for export.', 'intermediate', 50);

END $$; 