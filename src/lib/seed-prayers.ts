import type { CategoryEnum } from "@/lib/types/database";

export interface SeedPrayer {
  title: string;
  text: string;
  category: CategoryEnum[];
  prayer_count: number;
  answered?: { text: string };
}

export const SEED_PRAYERS: SeedPrayer[] = [

  // ════════════════════════════════════════════════════════════════
  // FAMILY — ~52 seeds (25%)
  // ════════════════════════════════════════════════════════════════

  // Marriage — heavy
  { title: "We're roommates now", text: "I can't remember the last time my husband actually looked at me. We just coexist around the kids.", category: ["family"], prayer_count: 18 },
  { title: "He said he's not happy", text: "He said it Sunday night after the kids went to bed. I haven't stopped shaking.", category: ["family"], prayer_count: 25 },
  { title: "He doesn't know how bad it is", text: "I cry in the shower so the kids don't hear. He thinks I'm fine.", category: ["family"], prayer_count: 22 },
  { title: "His phone is always face down", text: "I don't want to be that wife. But something feels off and I can't shake it.", category: ["family"], prayer_count: 17 },
  { title: "I found the messages", text: "It's 1am. Not physical. But emotional. With a coworker. I'm sitting in the bathroom while he sleeps.", category: ["family"], prayer_count: 24 },
  { title: "I think about leaving", text: "Not every day. But more than I used to. I don't know if that's normal.", category: ["family"], prayer_count: 19 },
  { title: "He won't go to counseling", text: "I begged. He said we don't need it. I need it.", category: ["family"], prayer_count: 15 },
  { title: "I don't feel safe with him", text: "Not physically. Emotionally. I can't be honest without it being used against me later.", category: ["family"], prayer_count: 21 },

  // Marriage — daily hard
  { title: "I don't recognize us anymore", text: "We used to be best friends. Now we fight about dishes and money and nothing gets resolved.", category: ["family"], prayer_count: 14 },
  { title: "We only talk about logistics", text: "Soccer schedule. Grocery list. Who's picking up. That's it. That's us now.", category: ["family"], prayer_count: 10 },
  { title: "We can't talk without fighting", text: "Every conversation turns into an argument. I'm so tired of walking on eggshells in my own house.", category: ["family"], prayer_count: 13 },
  { title: "He sleeps on the couch now", text: "After bedtime tonight I realized it's been three weeks. Neither of us decided it. Neither of us is fixing it.", category: ["family"], prayer_count: 11 },
  { title: "We haven't been intimate in months", text: "It's not that I don't love him. I just can't feel anything right now.", category: ["family"], prayer_count: 9 },
  { title: "I miss being chosen", text: "He chose me once. Now it feels like I'm just part of the routine.", category: ["family"], prayer_count: 12 },
  { title: "He forgot our anniversary", text: "I know it's small. But it's not small to me.", category: ["family"], prayer_count: 7 },
  { title: "The resentment is eating me alive", text: "I do everything. He does nothing. And when I bring it up I'm nagging.", category: ["family"], prayer_count: 16 },
  { title: "We're faking it at church", text: "Everyone thinks we're the couple that has it figured out. We barely speak in the car ride home.", category: ["family"], prayer_count: 15 },

  // Marriage — lighter/daily
  { title: "Date night felt forced", text: "We got a sitter for the first time in months. Sat across from each other with nothing to say.", category: ["family"], prayer_count: 8 },
  { title: "He's trying but it's not enough", text: "He brought me flowers yesterday. I didn't feel anything. That scared me.", category: ["family"], prayer_count: 11 },

  // Weaponized incompetence / not helping
  { title: "I'm jealous of his freedom", text: "He goes to the gym. He has hobbies. I have bedtime and dishes and the same four walls.", category: ["family"], prayer_count: 16 },
  { title: "He babysits his own kids", text: "He watched them for two hours Saturday and called it helping. I do it every single day.", category: ["family"], prayer_count: 13 },

  // Husband's addiction/porn
  { title: "Found it on his phone again", text: "He promised. Again. I don't know how many times I can believe him.", category: ["family", "inner_struggle"], prayer_count: 23, answered: { text: "He's been in a program for 6 weeks now. I can see him fighting for us. First time in a long time." } },

  // In-law conflict
  { title: "My mother-in-law is destroying me", text: "She undermines every parenting decision I make. My husband won't say anything.", category: ["family"], prayer_count: 17 },
  { title: "MIL told my 6-year-old I'm too strict", text: "In front of me. At Easter dinner. My husband laughed it off.", category: ["family"], prayer_count: 14 },

  // Single mom
  { title: "Single mom. No backup.", text: "There's no one to tap in. No one to hand my screaming 2-year-old to at 9pm. Just me.", category: ["family"], prayer_count: 24 },
  { title: "I can't do this custody schedule", text: "I drop them off Sunday night and the house goes silent. I don't know who I am in the quiet.", category: ["family"], prayer_count: 18 },
  { title: "Co-parenting with someone who hates me", text: "He turns the kids against me every other weekend. My 7-year-old asked why daddy says I'm mean.", category: ["family"], prayer_count: 20 },

  // Blended family
  { title: "Blended family is so hard", text: "His kids. My kids. Different rules. Different grief. Everyone's angry and no one says why.", category: ["family"], prayer_count: 11 },
  { title: "My stepdaughter told me I'm not her mom", text: "I know she's right. But I've been here 4 years. I'm the one who shows up.", category: ["family"], prayer_count: 13 },

  // Foster/adoptive
  { title: "Foster placement might end", text: "We've had him 14 months. Bio mom is back. I know it's the system. But he calls me mama.", category: ["family"], prayer_count: 25, answered: { text: "Adoption finalized yesterday. He's ours. I'm shaking typing this." } },

  // Military
  { title: "Third deployment", text: "My 5-year-old and 3-year-old ask when daddy's coming home every night. I run out of answers before I run out of bedtime.", category: ["family"], prayer_count: 19 },

  // Grandparent raising grandkid
  { title: "Starting over at 58", text: "My daughter's in rehab. I'm raising her 4-year-old. I love him but I'm so tired.", category: ["family"], prayer_count: 22 },

  // Other family
  { title: "My teenager hates me", text: "She's 15. She said it to my face tonight after I took her phone. I know she doesn't mean it. But it broke something.", category: ["family"], prayer_count: 13 },
  { title: "My daughter ran away", text: "She's 16. We had a fight and she left. It's been 3 days. I can't eat.", category: ["family"], prayer_count: 25, answered: { text: "She came home last night. We sat on the porch and cried. Long road ahead but she's here." } },
  { title: "We can't get pregnant", text: "Three years of trying. Four rounds of treatment. Every negative test breaks something new.", category: ["family", "health"], prayer_count: 23 },
  { title: "Adoption fell through", text: "We were days away. I already had the room set up. I can't bring myself to look at it.", category: ["family", "grief"], prayer_count: 21 },
  { title: "My parents are divorcing", text: "I'm 34 and it still feels like the ground fell out. My 6-year-old keeps asking why Grandpa moved.", category: ["family"], prayer_count: 12 },
  { title: "Newborn in the NICU", text: "She's 3 pounds. Day 9. They say she's doing well but I can barely look at all the wires.", category: ["family", "health"], prayer_count: 24, answered: { text: "We brought her home yesterday. 22 days in the NICU. I've never held anything so carefully." } },
  { title: "My son came out to me", text: "He's 17. I love him. That part is easy. I just don't know what to say to my church.", category: ["family"], prayer_count: 18 },
  { title: "I need to leave but I'm scared", text: "Financially I can't do it alone. But staying is killing me slowly.", category: ["family", "finances"], prayer_count: 22 },
  { title: "Arguing in front of the kids again", text: "My 5-year-old covered his ears. That image won't leave me.", category: ["family"], prayer_count: 15 },

  // Dad/husband seeds
  { title: "I don't know how to help her", text: "My wife is drowning. I can see it. She won't let me in. I don't know what I'm doing wrong.", category: ["family"], prayer_count: 16 },
  { title: "I'm failing as a dad", text: "My 8-year-old asked why I'm always on my phone. I put it down but the look on her face.", category: ["family"], prayer_count: 14 },

  // Lighter family
  { title: "My kid starts middle school Monday", text: "He's nervous. I'm more nervous. I just want him to be okay.", category: ["family"], prayer_count: 7 },
  { title: "Family reunion this weekend", text: "My family is... a lot. I'm already anxious. Pray I keep my mouth shut.", category: ["family"], prayer_count: 5 },
  { title: "Flying with two kids alone", text: "Cross-country flight tomorrow. 3-year-old and a 9-month-old. I've packed everything. I'm still terrified.", category: ["family"], prayer_count: 6 },

  // Broader family
  { title: "Starting over at 35", text: "Divorce finalized last month. I don't know who I am outside of that marriage.", category: ["family"], prayer_count: 15 },
  { title: "My brother won't speak to me", text: "It's been two years. I don't even remember what started it. I just miss him.", category: ["family"], prayer_count: 9 },
  { title: "My wife and I are separated", text: "She took the kids to her mom's. The house is so quiet it hurts.", category: ["family"], prayer_count: 20 },


  // ════════════════════════════════════════════════════════════════
  // INNER STRUGGLE — ~42 seeds (20%)
  // ════════════════════════════════════════════════════════════════

  // Heavy / crisis
  { title: "The intrusive thoughts are back", text: "Postpartum was supposed to be over by now. My son is 14 months. I'm scared to say this out loud.", category: ["inner_struggle", "health"], prayer_count: 24 },
  { title: "I fantasize about disappearing", text: "Midnight again and I'm awake. Not dying. Just vanishing. A hotel room with no one needing anything from me.", category: ["inner_struggle"], prayer_count: 20 },
  { title: "I don't want to be here", text: "Not like that. I'm not going anywhere. I just don't want to keep doing this.", category: ["inner_struggle"], prayer_count: 23 },
  { title: "I stopped taking my medication", text: "I thought I was better. I'm not. But I'm too embarrassed to call my doctor back.", category: ["inner_struggle", "health"], prayer_count: 19, answered: { text: "Called my doctor. Got back on them. Two weeks in and the fog is lifting. Should have called sooner." } },
  { title: "Addiction is winning right now", text: "I relapsed. I'm too ashamed to tell my small group.", category: ["inner_struggle"], prayer_count: 25, answered: { text: "47 days. I told someone. He didn't flinch. We meet every week now." } },
  { title: "Eating disorder is creeping back", text: "I thought it was behind me. The mirror disagrees. I'm counting again.", category: ["inner_struggle", "health"], prayer_count: 16 },
  { title: "I drink more than I should", text: "After bedtime tonight I had three glasses. Wine after bedtime turned into wine during bedtime. I need to stop.", category: ["inner_struggle"], prayer_count: 19 },

  // Hard but daily
  { title: "I'm so tired I can't even pray", text: "Can someone just pray for me? I don't have the words.", category: ["inner_struggle"], prayer_count: 21 },
  { title: "I can't sleep", text: "It's 3am. My mind won't stop. The kids. The money. The marriage. Every night.", category: ["inner_struggle"], prayer_count: 16 },
  { title: "I'm becoming my mother", text: "I hear her voice coming out of my mouth when I discipline my kids. I swore I never would.", category: ["inner_struggle"], prayer_count: 14 },
  { title: "I don't enjoy being a mom right now", text: "I love my three kids. But I don't like this life right now. And the guilt is crushing.", category: ["inner_struggle"], prayer_count: 22 },
  { title: "Rage mom again today", text: "I threw my 2-year-old's sippy cup at the wall. Not at anyone. But my hands are shaking.", category: ["inner_struggle"], prayer_count: 15 },
  { title: "I miss who I was before kids", text: "I love them more than anything. But I grieve the woman who had time to think.", category: ["inner_struggle"], prayer_count: 17 },
  { title: "I'm jealous of other moms", text: "Their husbands show up. Their houses are clean. I know it's not real but it hurts.", category: ["inner_struggle"], prayer_count: 13 },
  { title: "I yelled so loud the neighbor heard", text: "They were just being kids. My 4-year-old and 6-year-old. I sat in the bathroom after and hated myself.", category: ["inner_struggle"], prayer_count: 12 },
  { title: "I feel invisible", text: "I do everything for everyone. No one does anything for me. Not even a 'how are you.'", category: ["inner_struggle"], prayer_count: 14 },
  { title: "I scroll instead of sleeping", text: "It's the only time that's mine. 1am. I know it's making things worse.", category: ["inner_struggle"], prayer_count: 8 },
  { title: "My anxiety is ruining everything", text: "I can't drive on the highway anymore. Can't go to the store without my heart racing.", category: ["inner_struggle"], prayer_count: 17 },
  { title: "I don't recognize myself", text: "I used to be fun. I used to laugh. Now I'm just tired and angry and counting the hours.", category: ["inner_struggle"], prayer_count: 18 },
  { title: "I'm angry at God", text: "I prayed for help and got silence. I'm still here but I'm bitter about it.", category: ["inner_struggle"], prayer_count: 21 },
  { title: "I feel guilty for wanting space", text: "After bedtime I just stare at the wall. I love them. But when my 7-year-old, 4-year-old, and 1-year-old all need me at once I want to scream.", category: ["inner_struggle"], prayer_count: 10 },
  { title: "I can't forgive myself", text: "Something I did years ago. No one knows. But I carry it every single day.", category: ["inner_struggle"], prayer_count: 18 },
  { title: "I'm so angry all the time", text: "I don't even know what at anymore. Everything. Nothing. It's always there.", category: ["inner_struggle"], prayer_count: 12 },
  { title: "I can't cry anymore", text: "I think I'm numb. Things that should hurt just don't. That scares me more.", category: ["inner_struggle"], prayer_count: 10 },

  // Facade pattern
  { title: "Everyone thinks I have it together", text: "At church I smile. In the car I cry.", category: ["inner_struggle"], prayer_count: 19 },
  { title: "I smile at drop-off and cry in the car", text: "Sitting in the school pickup line right now typing this. Every morning I smile. Every morning I sit in this parking lot until I can see straight.", category: ["inner_struggle"], prayer_count: 16 },
  { title: "Nobody sees the real version", text: "Instagram gets the craft project. Nobody sees me locked in the pantry eating goldfish and shaking.", category: ["inner_struggle"], prayer_count: 13 },
  { title: "I faked being okay today", text: "Someone asked how I was. I said great. I don't even know why I lie anymore.", category: ["inner_struggle"], prayer_count: 11 },

  // Lighter / everyday anxiety
  { title: "Nervous about tomorrow", text: "Big conversation with my boss. I've rehearsed it fifty times. Still feel sick.", category: ["inner_struggle"], prayer_count: 5 },
  { title: "Can't stop overthinking", text: "One comment from a friend three days ago and I'm still replaying it at midnight.", category: ["inner_struggle"], prayer_count: 7 },
  { title: "I think I need help but I'm scared", text: "Therapy feels like admitting I can't handle it. But I can't handle it.", category: ["inner_struggle"], prayer_count: 21, answered: { text: "Had my first appointment. I cried the entire time. She said that's normal. Going back next week." } },

  // Broader
  { title: "I feel so alone", text: "I have people around me all the time and I've never felt more invisible.", category: ["inner_struggle"], prayer_count: 17 },
  { title: "Depression is back", text: "I thought I beat it. I didn't. Getting out of bed is the whole day's work.", category: ["inner_struggle"], prayer_count: 20, answered: { text: "Started therapy last month. It's slow. But I got out of bed before noon three days this week." } },
  { title: "The loneliness is physical", text: "It hurts in my chest. I moved for a job 6 months ago and I have no one here.", category: ["inner_struggle"], prayer_count: 14 },
  { title: "Panic attacks every morning", text: "5:45am. Before I even open my eyes my chest is tight. I dread the alarm.", category: ["inner_struggle"], prayer_count: 22 },
  { title: "I'm 26 and I feel stuck", text: "Everyone else is moving forward. I'm in the same apartment doing the same nothing.", category: ["inner_struggle"], prayer_count: 11 },
  { title: "Imposter syndrome", text: "Got the promotion. Now I'm terrified they'll figure out I don't belong here.", category: ["inner_struggle"], prayer_count: 7 },
  { title: "I keep choosing the wrong people", text: "Every relationship ends the same way. I'm the common denominator.", category: ["inner_struggle"], prayer_count: 8 },
  { title: "Struggling with porn again", text: "I thought getting married would fix it. It didn't. I hate the secret.", category: ["inner_struggle"], prayer_count: 18 },
  { title: "22 and already tired", text: "I thought life would feel like something by now. It just feels like waiting.", category: ["inner_struggle"], prayer_count: 9 },
  { title: "Church hurt", text: "The pastor said something from the stage that felt aimed at me. I haven't been back in 3 weeks.", category: ["inner_struggle"], prayer_count: 15 },
  { title: "I feel judged at church", text: "Single mom. Tattoos. I can feel the looks. I came for God not their approval.", category: ["inner_struggle"], prayer_count: 16 },


  // ════════════════════════════════════════════════════════════════
  // HEALTH — ~32 seeds (15%)
  // ════════════════════════════════════════════════════════════════

  // Heavy
  { title: "Waiting on results", text: "They found something on the scan. I go back Friday. I haven't told anyone.", category: ["health"], prayer_count: 19 },
  { title: "Postpartum depression is real", text: "I don't feel connected to my baby. He's 8 weeks old. Something is wrong with me.", category: ["health", "inner_struggle"], prayer_count: 22 },
  { title: "Postpartum rage", text: "It's not sadness. It's rage. At everything. At my 4-month-old crying. At myself. I scare myself.", category: ["health", "inner_struggle"], prayer_count: 20 },
  { title: "My daughter has an eating disorder", text: "She's 15 and I can see her ribs. She says she's fine. She weighs herself three times a day.", category: ["health"], prayer_count: 23 },
  { title: "My kid's diagnosis", text: "Autism spectrum. The doctor said it matter-of-factly. I cried in the parking lot for an hour.", category: ["health"], prayer_count: 20, answered: { text: "He started therapy and he's thriving. I was so scared for nothing. He's the same beautiful kid." } },
  { title: "Mom starts chemo Thursday", text: "She's acting brave. I'm pretending to be too. We're both terrified.", category: ["health"], prayer_count: 25, answered: { text: "Last round of chemo was Monday. Doctor says she's responding. We cried in the car together." } },
  { title: "Husband's heart condition", text: "Cardiologist used words I had to Google. We have three kids under 10.", category: ["health", "family"], prayer_count: 21 },

  // Hard but daily
  { title: "Chronic pain and no answers", text: "Seven doctors. Three years. Nobody can tell me what's wrong. I'm tired of hurting.", category: ["health"], prayer_count: 17 },
  { title: "My anxiety medication isn't working", text: "I told my doctor but changing meds scares me more than staying on these.", category: ["health", "inner_struggle"], prayer_count: 12 },
  { title: "Migraine every day this week", text: "The light hurts. The noise hurts. My 3-year-old and 5-year-old are loud and I love them but I need it to stop.", category: ["health"], prayer_count: 10 },
  { title: "Insomnia for weeks", text: "It's 3am again. My body is tired but my brain won't stop. My 1-year-old will be up in 3 hours.", category: ["health"], prayer_count: 13 },
  { title: "Thyroid is off again", text: "Weight gain. Fatigue. Brain fog. I used to be sharp. I feel like I'm fading.", category: ["health"], prayer_count: 14 },
  { title: "Long COVID still", text: "It's been over a year. Nobody believes me anymore. I'm not making this up.", category: ["health"], prayer_count: 12 },
  { title: "Haven't been to the doctor in years", text: "I take the kids to every appointment. I never make one for myself. I'm scared what they'll find.", category: ["health"], prayer_count: 11 },
  { title: "Breastfeeding is destroying me", text: "She's 5 months. Everyone says it's beautiful. I dread every feeding. The guilt of wanting to quit won't let me.", category: ["health"], prayer_count: 14 },

  // Lighter
  { title: "Praying mom's surgery goes well", text: "Knee replacement tomorrow morning. She's 67. I know it's routine but she's my mom.", category: ["health"], prayer_count: 8 },
  { title: "My son has a big surgery Friday", text: "He's 7. Tonsils and adenoids. He's braver than I am.", category: ["health"], prayer_count: 15, answered: { text: "He woke up from surgery and asked for chicken nuggets. I've never been so relieved." } },
  { title: "Recovery is so slow", text: "Knee surgery was a month ago. I can barely walk to the mailbox. I feel useless.", category: ["health"], prayer_count: 9, answered: { text: "Walked half a mile today without stopping. PT is working. Slow but real." } },
  { title: "My son's speech delay", text: "He's 3 and barely talks. The other kids at the park are having full conversations.", category: ["health"], prayer_count: 15 },
  { title: "Dental pain I can't afford to fix", text: "Haven't been to a dentist in 4 years. It's getting worse. There's no room in the budget.", category: ["health", "finances"], prayer_count: 8 },

  // Broader
  { title: "My best friend was diagnosed", text: "She's 28. I don't know what to say to her.", category: ["health"], prayer_count: 18 },
  { title: "My dad has Alzheimer's", text: "He called me by my mother's name today. She's been dead for ten years.", category: ["health", "grief"], prayer_count: 19 },
  { title: "Autoimmune diagnosis", text: "Lupus. I'm 31. I just keep staring at the pamphlets they gave me.", category: ["health"], prayer_count: 16 },
  { title: "My kid is in the hospital", text: "RSV turned into pneumonia. He's 11 months old and so small in that bed. I haven't left this room in 3 days.", category: ["health"], prayer_count: 25, answered: { text: "Home. He's home. Running around like nothing happened. I'm the one still recovering." } },
  { title: "Waiting on biopsy", text: "They said probably nothing. But probably isn't definitely and I can't breathe.", category: ["health"], prayer_count: 20, answered: { text: "Benign. I sobbed in the car for twenty minutes. Thank you." } },
  { title: "Fertility treatments failing", text: "Fourth round. My body is exhausted. My heart is exhausted. I don't know how many more I have in me.", category: ["health", "family"], prayer_count: 22 },
  { title: "Panic attacks feel like dying", text: "I've been to the ER twice. They say it's anxiety. It doesn't feel like just anxiety.", category: ["health", "inner_struggle"], prayer_count: 16 },
  { title: "High-risk pregnancy", text: "Bed rest for 8 weeks. I have a 2-year-old. My husband works 10-hour shifts.", category: ["health", "family"], prayer_count: 21 },
  { title: "Friend's kid has leukemia", text: "He's 4. She called me at midnight. I don't know what to do except pray.", category: ["health"], prayer_count: 24 },
  { title: "Misdiagnosed for years", text: "Turns out it wasn't anxiety. It was my thyroid the whole time. I lost years feeling crazy.", category: ["health"], prayer_count: 11 },
  { title: "Surgery next week", text: "They say it's routine. Nothing about someone cutting me open feels routine.", category: ["health"], prayer_count: 15 },


  // ════════════════════════════════════════════════════════════════
  // SCHOOL / KIDS — ~25 seeds (12%)
  // ════════════════════════════════════════════════════════════════

  // Heavy
  { title: "My daughter said she wants to die", text: "She's 11. She said it quietly. Like it was nothing. I'm terrified.", category: ["school", "inner_struggle"], prayer_count: 25 },
  { title: "She's cutting herself", text: "I saw the marks on her arm when she reached for a glass. She pulled away. She's 14.", category: ["school", "health"], prayer_count: 24 },
  { title: "I found something on her phone", text: "She's 13. I'm scared and I don't know who to talk to about what I saw.", category: ["school"], prayer_count: 22 },
  { title: "Something's wrong with my son", text: "He's 7. His teacher called again. Third time this month. I don't know what I'm doing wrong.", category: ["school"], prayer_count: 15 },

  // Hard but daily
  { title: "I raised my voice again", text: "I told myself I wouldn't yell today. By 4pm I was screaming. My 6-year-old's face.", category: ["school"], prayer_count: 18 },
  { title: "I love them but I'm drowning", text: "Three kids under 5. I haven't had a thought to myself in weeks.", category: ["school"], prayer_count: 20 },
  { title: "My kid has no friends", text: "He's 10. He eats lunch alone every day. He told me like it was nothing. I cried after he went to bed.", category: ["school"], prayer_count: 17, answered: { text: "She made a friend at school today. Just one. I cried in the pickup line." } },
  { title: "IEP meeting tomorrow", text: "I have to fight for my kid again. I'm so tired of begging a system to see my child.", category: ["school"], prayer_count: 19 },
  { title: "He's failing 3 classes", text: "He's smart. I know he is. But he won't try and I can't make him care. He's 15.", category: ["school"], prayer_count: 11 },
  { title: "My son won't talk to me", text: "He used to tell me everything. Now he goes straight to his room. Door locked. He's 13.", category: ["school"], prayer_count: 16 },
  { title: "My kid is being bullied", text: "He's 9. He doesn't want to go to school. This morning he said he wished he was invisible.", category: ["school"], prayer_count: 23, answered: { text: "Teacher moved his seat. New kid started sitting with him at lunch. He came home smiling." } },
  { title: "Homeschooling is breaking me", text: "Three kids — 10, 7, and 5. I chose this. I know. But I'm failing as their teacher and their mom at the same time.", category: ["school"], prayer_count: 14 },

  // ADHD/autism
  { title: "ADHD diagnosis feels heavy", text: "I don't want to medicate him. But I don't want him to struggle either. He's 8. No choice feels right.", category: ["school", "health"], prayer_count: 18, answered: { text: "We tried a low dose. His teacher said he raised his hand for the first time. He said 'Mom, my brain is quieter.'" } },

  // Screen time
  { title: "Three hours of iPad today", text: "So I could work. I know the studies. I know the recommendations. The guilt is constant.", category: ["school"], prayer_count: 5 },

  // Lighter
  { title: "Bedtime takes three hours", text: "Water. Bathroom. One more story. My 3-year-old is still calling for me and I'm touched out.", category: ["school"], prayer_count: 6 },
  { title: "Toddler tantrums all day", text: "My 2-year-old screamed for twelve hours. I know it's a phase. I just need to survive it.", category: ["school"], prayer_count: 9 },
  { title: "My kid lied to my face", text: "She looked right at me and lied. She's 8. I don't know if I handled it right.", category: ["school"], prayer_count: 7 },
  { title: "First day of kindergarten Monday", text: "He's 5. He's not ready. I'm not ready. I don't want to let go yet.", category: ["school"], prayer_count: 8 },
  { title: "My 4-year-old asked why daddy yells", text: "I didn't have an answer. I just held her.", category: ["school", "family"], prayer_count: 16 },
  { title: "Teenager's grades dropped", text: "She's 16. Straight As to Cs in two months. Something happened. She won't tell me what.", category: ["school"], prayer_count: 14 },
  { title: "My baby won't stop crying", text: "She's 6 weeks old. Colic, they say. I rock and bounce and nothing helps. It's naptime and I'm in the closet typing this.", category: ["school"], prayer_count: 15 },
  { title: "He hits his sister", text: "He's 4. She's 2. I separate them a hundred times a day. By bedtime I'm hollow.", category: ["school"], prayer_count: 10 },
  { title: "Summer break is coming", text: "No camp money. No help. 10 weeks of three kids home with me. I'm already anxious.", category: ["school", "finances"], prayer_count: 12 },
  { title: "My son has a big test tomorrow", text: "He's 12. He studied all weekend. He's so nervous he can't eat dinner. I just want him to feel okay.", category: ["school"], prayer_count: 4 },
  { title: "She won't nap anymore", text: "18 months old and the naps are gone. That hour was the only thing keeping me sane.", category: ["school"], prayer_count: 6 },


  // ════════════════════════════════════════════════════════════════
  // FINANCES — ~21 seeds (10%)
  // ════════════════════════════════════════════════════════════════

  { title: "Nobody knows we're broke", text: "We smile on Sundays and I check our account on Monday wondering how we'll make it.", category: ["finances"], prayer_count: 21 },
  { title: "I can't afford groceries this week", text: "I'll figure it out. I always do. But tonight I'm scared.", category: ["finances"], prayer_count: 18 },
  { title: "Daycare costs more than rent", text: "I'm working just to pay someone else to raise my kids. What's the point.", category: ["finances", "family"], prayer_count: 16 },
  { title: "Medical bills are crushing us", text: "Insurance covered 'most of it.' Most isn't enough when you have nothing.", category: ["finances", "health"], prayer_count: 22 },
  { title: "My husband lost his job", text: "He hasn't told anyone. He leaves every morning like he's going to work. I'm carrying the secret.", category: ["finances", "family"], prayer_count: 24, answered: { text: "He got an offer yesterday. Better company. He cried at the kitchen table. First time I've seen that." } },
  { title: "Behind on the mortgage", text: "Two months. One more and we're in real trouble. I haven't told my wife.", category: ["finances"], prayer_count: 20 },
  { title: "Car broke down again", text: "Can't afford to fix it. Can't afford not to. It's how I get to work. How the kids get to school.", category: ["finances"], prayer_count: 17, answered: { text: "A woman at church heard. She gave us her old car. Just handed over the keys. I can't stop crying." } },
  { title: "Choosing between rent and food", text: "I never thought I'd be here. But here I am. Again.", category: ["finances"], prayer_count: 23 },
  { title: "Credit card debt is out of control", text: "I was just trying to keep us afloat. Now I can't see over the balance.", category: ["finances"], prayer_count: 13 },
  { title: "We can't afford the medication", text: "My 7-year-old needs it. Insurance won't cover it. I'm calling every pharmacy in town.", category: ["finances", "health"], prayer_count: 22 },
  { title: "Paycheck to paycheck", text: "I'm 38. I thought by now I'd have breathing room. Instead I have $47 until Friday.", category: ["finances"], prayer_count: 16 },
  { title: "Can't afford therapy", text: "I finally had the courage to go and then I saw the copay. $150 a session.", category: ["finances", "inner_struggle"], prayer_count: 18 },
  { title: "Unexpected ER bill wiped us out", text: "$4,200. No insurance. That was our savings. All of it.", category: ["finances", "health"], prayer_count: 20 },
  { title: "Drowning in student loans", text: "I owe more than I'll make this year. The math never works. It keeps me up at night.", category: ["finances"], prayer_count: 12 },
  { title: "Single income isn't enough", text: "We decided I'd stay home. I don't regret it. But we're one broken appliance away from crisis.", category: ["finances"], prayer_count: 11 },
  { title: "Disability denied again", text: "I can't work. The government says I can. My body disagrees.", category: ["finances", "health"], prayer_count: 14 },
  { title: "Husband hides spending", text: "Found the credit card statement. He didn't tell me about any of it. $2,300.", category: ["finances", "family"], prayer_count: 19 },
  { title: "Can't afford Christmas this year", text: "My 8-year-old and 5-year-old are making wish lists. I'm making excuses.", category: ["finances"], prayer_count: 15 },
  { title: "My roommate moved out", text: "I can't afford this apartment alone. I have two weeks to figure it out.", category: ["finances"], prayer_count: 10 },
  { title: "Tax refund was our only hope", text: "And it's less than half what we expected. I had plans for that money. Now there's no plan.", category: ["finances"], prayer_count: 9 },
  { title: "Diapers or gas", text: "That's the math this week for my 10-month-old. One or the other. I'm doing the math at 11pm.", category: ["finances"], prayer_count: 19 },


  // ════════════════════════════════════════════════════════════════
  // GRIEF — ~21 seeds (10%)
  // ════════════════════════════════════════════════════════════════

  // Heavy
  { title: "I had a miscarriage on Tuesday", text: "Went to small group Thursday and smiled. Nobody asked.", category: ["grief", "health"], prayer_count: 23 },
  { title: "Stillbirth at 37 weeks", text: "I held her. She was perfect. I came home to a nursery I can't walk into.", category: ["grief"], prayer_count: 25 },
  { title: "My friend died by suicide", text: "I talked to her Monday. By Wednesday she was gone. I keep reading our last texts.", category: ["grief"], prayer_count: 24 },
  { title: "My dad is in hospice", text: "They say days. Maybe a week. I'm trying to hold it together for everyone.", category: ["grief"], prayer_count: 25, answered: { text: "He passed Sunday morning. I was holding his hand. Hardest and most sacred thing I've ever done." } },
  { title: "My brother overdosed", text: "He survived. Barely. And I'm angry and relieved and terrified all at once.", category: ["grief", "family"], prayer_count: 22, answered: { text: "He's in a 90-day program. Calls every Sunday. His voice sounds different. Like him again." } },

  // Hard but daily
  { title: "Second miscarriage", text: "Different doctor. Same result. I can't talk about it anymore. But I can't stop thinking about it.", category: ["grief", "health"], prayer_count: 21 },
  { title: "Mom died six months ago", text: "Everyone's moved on. I haven't. I still reach for my phone to call her.", category: ["grief"], prayer_count: 19 },
  { title: "I never got to say goodbye", text: "She died while I was on the highway trying to get there. Twenty minutes too late.", category: ["grief"], prayer_count: 23 },
  { title: "My baby would have been one today", text: "I know the due date by heart. Nobody else remembers.", category: ["grief"], prayer_count: 20 },
  { title: "I lost the pregnancy at 8 weeks", text: "I hadn't told anyone yet. So now I'm grieving something nobody knew existed.", category: ["grief", "health"], prayer_count: 17 },
  { title: "I'm grieving someone who's alive", text: "Dementia took my mother before her body gave up. She doesn't know my name.", category: ["grief", "health"], prayer_count: 18 },
  { title: "Anniversary of his death tomorrow", text: "I know it's coming every year. Doesn't matter. The weight shows up early.", category: ["grief"], prayer_count: 16 },
  { title: "Chemical pregnancy", text: "Two lines then blood the next day. It barely counts to anyone else. It counts to me.", category: ["grief", "health"], prayer_count: 15 },
  { title: "Can't stop crying today", text: "It's been two years since she died and today hit like the first week. Aisle 7 at the grocery store.", category: ["grief"], prayer_count: 14 },
  { title: "My husband's memorial was today", text: "One year. People brought flowers. I wanted to scream. Instead I served cake.", category: ["grief"], prayer_count: 22 },
  { title: "Grief came back out of nowhere", text: "I was fine. Then I saw her favorite cereal at the store and completely lost it.", category: ["grief"], prayer_count: 13 },

  // Lighter
  { title: "Our dog died", text: "He was 14 years. The house is too quiet now. I know people don't get it.", category: ["grief"], prayer_count: 8 },
  { title: "Best friend moved away", text: "I know it's not death. But it's a loss and nobody treats it like one.", category: ["grief"], prayer_count: 7 },
  { title: "Father's Day is the worst", text: "He died when I was 12. Every year someone asks what I got my dad.", category: ["grief"], prayer_count: 12 },

  // Broader
  { title: "My student died", text: "I'm a teacher. He was 16. I saw him Friday. They told us at a staff meeting.", category: ["grief"], prayer_count: 24 },
  { title: "Lost my grandmother", text: "She raised me. She was more mom than grandma. The funeral is Saturday and I can't write the eulogy.", category: ["grief"], prayer_count: 14 },


  // ════════════════════════════════════════════════════════════════
  // WORK — ~10 seeds (5%)
  // ════════════════════════════════════════════════════════════════

  { title: "Going back to work Monday", text: "Maternity leave ends. She's 12 weeks old. I don't want to hand her to someone else.", category: ["work"], prayer_count: 21, answered: { text: "First week done. I cried at my desk. But she was happy when I picked her up. We'll be okay." } },
  { title: "Working two jobs and still behind", text: "I leave one and go straight to the other. My kids are asleep both times.", category: ["work", "finances"], prayer_count: 19 },
  { title: "Lost my job last week", text: "I keep refreshing my email waiting for callbacks. The silence is loud.", category: ["work"], prayer_count: 16, answered: { text: "Got a call this morning. Start Monday. It's less money but it's something. I can breathe." } },
  { title: "Toxic workplace but I can't leave", text: "The insurance. The paycheck. I'm trapped by my own responsibilities.", category: ["work"], prayer_count: 14 },
  { title: "Boss makes me dread Mondays", text: "I used to love what I do. Now I sit in the parking lot for 10 minutes trying to go in.", category: ["work"], prayer_count: 12 },
  { title: "I got passed over again", text: "Third time. Less qualified people keep getting promoted. I'm starting to believe the pattern.", category: ["work"], prayer_count: 10 },
  { title: "I leave before they wake up", text: "I get home after bedtime. My 3-year-old asked the sitter yesterday if I still live here.", category: ["work", "family"], prayer_count: 20 },
  { title: "Starting a new job Monday", text: "I should be excited. I'm just scared I'll mess it up.", category: ["work"], prayer_count: 6 },
  { title: "Mom guilt for working", text: "I have to work. We need the money. But every time I drop her off I feel like I'm choosing wrong.", category: ["work", "inner_struggle"], prayer_count: 15 },
  { title: "Mom guilt for not working", text: "We can't afford much. I feel selfish staying home. But someone asked what I 'do' and I had no answer.", category: ["work", "inner_struggle"], prayer_count: 13 },


  // ════════════════════════════════════════════════════════════════
  // OTHER — ~7 seeds (3%)
  // ════════════════════════════════════════════════════════════════

  { title: "Just need someone to know", text: "I'm not okay today. I don't know why.", category: ["other"], prayer_count: 15 },
  { title: "Struggling with faith", text: "I believe but I don't feel anything anymore. Just going through the motions.", category: ["other"], prayer_count: 18 },
  { title: "I don't fit anywhere", text: "Not enough for the church crowd. Too much for everyone else. Just floating.", category: ["other"], prayer_count: 11 },
  { title: "I want to believe again", text: "Something broke my faith a few years ago. I'm here because I want it back.", category: ["other"], prayer_count: 20 },
  { title: "Please", text: "I don't even know what to ask for. Just please.", category: ["other"], prayer_count: 14 },
  { title: "Day 3", text: "That's all I can say. Day 3.", category: ["other"], prayer_count: 9 },
  { title: "It's 2am", text: "I should be sleeping. Instead I'm here. I guess that says enough.", category: ["other"], prayer_count: 12 },


  // ════════════════════════════════════════════════════════════════
  // FACADE PATTERN — 15 seeds (public/private split)
  // ════════════════════════════════════════════════════════════════

  { title: "They congratulated me at church", text: "Baby shower. Everyone was so happy for us. I cried in the bathroom after because we can barely afford this.", category: ["finances", "family"], prayer_count: 14 },
  { title: "My Instagram is a lie", text: "I posted the craft project. Nobody sees me locked in the pantry five minutes later shaking.", category: ["inner_struggle"], prayer_count: 16 },
  { title: "I told the pediatrician everything was fine", text: "She asked how I was doing. I said great. My 4-month-old was screaming and I wanted to hand her back.", category: ["health"], prayer_count: 18 },
  { title: "Teacher said he's doing great", text: "At conferences she smiled. He's doing great at school. At home he screams for two hours every night. I didn't say that.", category: ["school"], prayer_count: 11 },
  { title: "They think I love staying home", text: "I chose this. So I can't complain. But I haven't spoken to an adult in 4 days and I'm losing it.", category: ["work", "inner_struggle"], prayer_count: 13 },
  { title: "I smiled through the whole party", text: "My daughter's 6th birthday. Thirty people in my house. I hosted and cleaned and smiled. Then I sat in the garage and cried.", category: ["family"], prayer_count: 10 },
  { title: "I said the pregnancy was planned", text: "It wasn't. I'm terrified. But everyone's so excited I can't tell the truth.", category: ["health", "family"], prayer_count: 17 },
  { title: "We look happy in the Christmas card", text: "Matching outfits. Big smiles. We fought the entire way there and didn't speak the drive home.", category: ["family"], prayer_count: 12 },
  { title: "My coworkers think I'm fine", text: "I eat lunch at my desk so no one sees me cry. I come back from the bathroom with a smile.", category: ["work"], prayer_count: 9 },
  { title: "I said I wasn't tired", text: "My husband asked once. I said I'm fine. Because if I start talking I won't stop and I don't want to be that wife.", category: ["family", "inner_struggle"], prayer_count: 15 },
  { title: "Everyone says I make it look easy", text: "Two kids. Full-time job. Volunteer at church. I'm running on caffeine and resentment.", category: ["inner_struggle"], prayer_count: 18 },
  { title: "I pretended to laugh at the playdate", text: "The other moms were talking about their husbands being useless and laughing. Mine actually is. It's not funny.", category: ["family"], prayer_count: 11 },
  { title: "I lied to my small group", text: "They asked for prayer requests. I said work stress. The real one I can't say out loud yet.", category: ["inner_struggle"], prayer_count: 14 },
  { title: "I told my mom I'm doing well", text: "She's 800 miles away. She can't help. So I lie every Sunday phone call.", category: ["family"], prayer_count: 8 },
  { title: "Dropped them off and sat there", text: "Dropped the kids at school. Sat in the parking lot for 40 minutes. Couldn't drive. Couldn't cry. Just sat.", category: ["inner_struggle"], prayer_count: 19 },


  // ════════════════════════════════════════════════════════════════
  // BODY IMAGE — 1 seed
  // ════════════════════════════════════════════════════════════════

  { title: "I hate what I see", text: "I avoid mirrors. I avoid photos. My husband says I look fine. I don't feel fine. Not since the baby.", category: ["inner_struggle", "health"], prayer_count: 15 },
];

export function getAnsweredSeeds(): { index: number; text: string }[] {
  const answered: { index: number; text: string }[] = [];
  SEED_PRAYERS.forEach((seed, i) => {
    if (seed.answered) {
      answered.push({ index: i, text: seed.answered.text });
    }
  });
  return answered;
}

export function getSeedPrayers() {
  return SEED_PRAYERS;
}

export function getAnsweredUpdates() {
  return getAnsweredSeeds();
}
