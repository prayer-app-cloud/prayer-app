-- Seed 30 realistic prayer requests with humanized text.
-- All marked is_seed=true, status=active, expire in 7 days.
-- Prayer counts randomized between 0-15.
-- session_id='seed' for all.

INSERT INTO prayer_requests (title, text, category, urgency, display_name_snapshot, is_seed, status, session_id, anonymous, expires_at, prayer_count, share_slug) VALUES

-- 1
('Please pray for my mom''s surgery Friday',
 'She''s going in for a double bypass and I''m trying to hold it together for my family but I''m terrified. She''s 67 and has diabetes too. I just need peace.',
 ARRAY['health','family']::text[], 'high', 'QuietRiver', true, 'active', 'seed', false,
 now() + interval '7 days', floor(random() * 16)::int,
 'seed-' || gen_random_uuid()),

-- 2
('Lost my job today',
 'Got laid off this morning. No warning. I have two kids and rent is due in 12 days. I don''t even know what to tell my wife yet. Just feeling numb.',
 ARRAY['finances','family']::text[], 'high', 'SteadyStone', true, 'active', 'seed', false,
 now() + interval '7 days', floor(random() * 16)::int,
 'seed-' || gen_random_uuid()),

-- 3
('My anxiety is so bad I can''t leave the house',
 'It''s been three weeks since I''ve gone anywhere except the mailbox. I know God is with me but I feel so stuck. Please pray I find the courage to get help.',
 ARRAY['inner_struggle','health']::text[], 'normal', 'GentleDawn', true, 'active', 'seed', false,
 now() + interval '7 days', floor(random() * 16)::int,
 'seed-' || gen_random_uuid()),

-- 4
('Praying for my daughter''s addiction',
 'She''s 19 and won''t talk to us anymore. We found out she''s been using again. I don''t sleep. I just pray and cry. Please join me.',
 ARRAY['family','health']::text[], 'high', 'FaithfulShore', true, 'active', 'seed', false,
 now() + interval '7 days', floor(random() * 16)::int,
 'seed-' || gen_random_uuid()),

-- 5
('Struggling with doubt',
 'I''ve been a believer my whole life but lately I feel nothing when I pray. Like I''m talking to a wall. I hate admitting this. Has anyone else been here?',
 ARRAY['inner_struggle']::text[], 'normal', 'StillMeadow', true, 'active', 'seed', false,
 now() + interval '7 days', floor(random() * 16)::int,
 'seed-' || gen_random_uuid()),

-- 6
('Husband deployed again',
 'Third deployment in four years. The kids keep asking when daddy''s coming home and I just smile and say soon. Please pray for his safety and for strength for me and the kids.',
 ARRAY['family']::text[], 'normal', 'WarmLight', true, 'active', 'seed', false,
 now() + interval '7 days', floor(random() * 16)::int,
 'seed-' || gen_random_uuid()),

-- 7
('Final exams next week',
 'I know this seems small compared to other requests here but I''ve failed this class twice and if I don''t pass I lose my scholarship. It''s everything.',
 ARRAY['work_school']::text[], 'normal', 'HopefulBreeze', true, 'active', 'seed', false,
 now() + interval '7 days', floor(random() * 16)::int,
 'seed-' || gen_random_uuid()),

-- 8
('My best friend was diagnosed with cancer',
 'She''s 28. Twenty eight. We were supposed to be bridesmaids at each other''s weddings. They say it''s treatable but I''m so scared. Please pray for Sarah.',
 ARRAY['health','grief']::text[], 'high', 'TenderGarden', true, 'active', 'seed', false,
 now() + interval '7 days', floor(random() * 16)::int,
 'seed-' || gen_random_uuid()),

-- 9
('Can''t forgive myself',
 'I did something that hurt someone I love and they forgave me but I can''t forgive myself. It''s been months and the guilt is eating me alive.',
 ARRAY['inner_struggle']::text[], 'normal', 'CalmHarbor', true, 'active', 'seed', false,
 now() + interval '7 days', floor(random() * 16)::int,
 'seed-' || gen_random_uuid()),

-- 10
('Waiting for biopsy results',
 'Doctor found something on the scan last week. Results come Thursday. I''m trying to trust God but the waiting is the hardest part. Just need people praying.',
 ARRAY['health']::text[], 'normal', 'QuietDawn', true, 'active', 'seed', false,
 now() + interval '7 days', floor(random() * 16)::int,
 'seed-' || gen_random_uuid()),

-- 11
('My marriage is falling apart',
 'We don''t fight anymore. We just don''t talk. It''s like living with a roommate. I still love him but I don''t think he loves me back. Pray we find our way.',
 ARRAY['family','inner_struggle']::text[], 'normal', 'GentleRain', true, 'active', 'seed', false,
 now() + interval '7 days', floor(random() * 16)::int,
 'seed-' || gen_random_uuid()),

-- 12
('Starting over at 45',
 'Divorce finalized last month. New apartment. New everything. I''m supposed to feel free but I just feel lost. Pray I figure out who I am now.',
 ARRAY['inner_struggle','family']::text[], 'normal', 'SteadyLight', true, 'active', 'seed', false,
 now() + interval '7 days', floor(random() * 16)::int,
 'seed-' || gen_random_uuid()),

-- 13
('Rent is $200 short this month',
 'I''ve sold everything I can. Picked up extra shifts. Still short. I know God provides but right now I''m panicking. Please pray something comes through.',
 ARRAY['finances']::text[], 'high', 'KindStone', true, 'active', 'seed', false,
 now() + interval '7 days', floor(random() * 16)::int,
 'seed-' || gen_random_uuid()),

-- 14
('Grieving my dad — 1 year today',
 'One year since he passed and it still hits me at random moments. Heard his favorite song in the grocery store and lost it. Miss you dad.',
 ARRAY['grief']::text[], 'normal', 'WarmMeadow', true, 'active', 'seed', false,
 now() + interval '7 days', floor(random() * 16)::int,
 'seed-' || gen_random_uuid()),

-- 15
('Pray for my sobriety',
 '47 days clean. Longest I''ve gone in years. Every day is a fight. I don''t have many people I can tell this to. Grateful for this place.',
 ARRAY['health','inner_struggle']::text[], 'normal', 'FaithfulDawn', true, 'active', 'seed', false,
 now() + interval '7 days', floor(random() * 16)::int,
 'seed-' || gen_random_uuid()),

-- 16
('Son is being bullied at school',
 'He came home crying again. He''s 9. The school says they''re handling it but nothing changes. I feel helpless. Pray for his heart and for wisdom for us as parents.',
 ARRAY['family']::text[], 'normal', 'TenderShore', true, 'active', 'seed', false,
 now() + interval '7 days', floor(random() * 16)::int,
 'seed-' || gen_random_uuid()),

-- 17
('Interview tomorrow morning',
 'I''ve been unemployed for 4 months. This is the first callback I''ve gotten. I really need this. Pray I show up calm and prepared.',
 ARRAY['work_school','finances']::text[], 'normal', 'HopefulRiver', true, 'active', 'seed', false,
 now() + interval '7 days', floor(random() * 16)::int,
 'seed-' || gen_random_uuid()),

-- 18
('Please pray for my premature baby',
 'Born at 31 weeks. She''s in the NICU and they say she''s doing okay but she''s so tiny. I just want to hold her. Her name is Lily.',
 ARRAY['health','family']::text[], 'high', 'QuietGarden', true, 'active', 'seed', false,
 now() + interval '7 days', floor(random() * 16)::int,
 'seed-' || gen_random_uuid()),

-- 19
('Feeling far from God',
 'I go to church. I read my Bible. I do all the right stuff. But it feels hollow. Like going through the motions. I miss actually wanting to be there.',
 ARRAY['inner_struggle']::text[], 'normal', 'StillBreeze', true, 'active', 'seed', false,
 now() + interval '7 days', floor(random() * 16)::int,
 'seed-' || gen_random_uuid()),

-- 20
('Grandma is in hospice',
 'She raised me. She''s the reason I believe. The doctors say days, maybe a week. I''m not ready. Please pray for peace for her and strength for our family.',
 ARRAY['grief','family']::text[], 'high', 'GentleHarbor', true, 'active', 'seed', false,
 now() + interval '7 days', floor(random() * 16)::int,
 'seed-' || gen_random_uuid()),

-- 21
('Drowning in student loans',
 '82k in debt and making minimum payments on a teacher''s salary. Some days I wonder if getting the degree was even worth it. I love teaching but the money stress is real.',
 ARRAY['finances','work_school']::text[], 'normal', 'CalmRiver', true, 'active', 'seed', false,
 now() + interval '7 days', floor(random() * 16)::int,
 'seed-' || gen_random_uuid()),

-- 22
('My dog is dying',
 'I know some people won''t get this but he''s been my companion for 13 years. He got me through my divorce, my depression, everything. Vet says this week. My heart is breaking.',
 ARRAY['grief']::text[], 'normal', 'WarmStone', true, 'active', 'seed', false,
 now() + interval '7 days', floor(random() * 16)::int,
 'seed-' || gen_random_uuid()),

-- 23
('Pray for my country',
 'I''m not going to say which one. Just know there are people here who are scared. The news doesn''t cover it. We need peace and we need it soon.',
 ARRAY['other']::text[], 'normal', 'SteadyDawn', true, 'active', 'seed', false,
 now() + interval '7 days', floor(random() * 16)::int,
 'seed-' || gen_random_uuid()),

-- 24 (answered prayer)
('I got the job',
 'Update: I posted here last week asking for prayer about an interview. I got it. Start Monday. Thank you to everyone who prayed. God is good.',
 ARRAY['work_school','finances']::text[], 'normal', 'HopefulRiver', true, 'answered', 'seed', false,
 now() + interval '7 days', floor(random() * 16)::int,
 'seed-' || gen_random_uuid()),

-- 25
('Miscarriage last week',
 'Third one. I don''t know what to say anymore. I''m angry and sad and tired of people telling me it''s God''s plan. Just pray. Please.',
 ARRAY['grief','health']::text[], 'normal', 'KindLight', true, 'active', 'seed', false,
 now() + interval '7 days', floor(random() * 16)::int,
 'seed-' || gen_random_uuid()),

-- 26
('Teenager won''t come home',
 'She''s 16 and staying with friends. Won''t answer my calls. I know she''s safe but she''s so angry at me. I just want my girl back.',
 ARRAY['family']::text[], 'normal', 'FaithfulMeadow', true, 'active', 'seed', false,
 now() + interval '7 days', floor(random() * 16)::int,
 'seed-' || gen_random_uuid()),

-- 27
('Work stress is crushing me',
 'New manager is making everything toxic. I used to love my job. Now I get Sunday night dread every week. Pray for wisdom on whether I stay or go.',
 ARRAY['work_school','inner_struggle']::text[], 'normal', 'TenderRiver', true, 'active', 'seed', false,
 now() + interval '7 days', floor(random() * 16)::int,
 'seed-' || gen_random_uuid()),

-- 28
('Grateful today',
 'No big request. Just wanted to say I''m grateful to be alive today. Been through a dark year and the light is starting to come back. God is faithful.',
 ARRAY['other']::text[], 'normal', 'CalmDawn', true, 'active', 'seed', false,
 now() + interval '7 days', floor(random() * 16)::int,
 'seed-' || gen_random_uuid()),

-- 29
('Moving to a new city alone',
 'Starting a new life in a city where I know nobody. It''s exciting and terrifying. Pray I find community and a good church.',
 ARRAY['inner_struggle','other']::text[], 'normal', 'GentleLight', true, 'active', 'seed', false,
 now() + interval '7 days', floor(random() * 16)::int,
 'seed-' || gen_random_uuid()),

-- 30
('Pray for my pastor',
 'He''s been carrying our church through a really hard season and I can tell he''s burning out. Pastors need prayer too. He won''t ask for it himself.',
 ARRAY['other','family']::text[], 'normal', 'WarmBreeze', true, 'active', 'seed', false,
 now() + interval '7 days', floor(random() * 16)::int,
 'seed-' || gen_random_uuid());
