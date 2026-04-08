interface Verse {
  text: string;
  reference: string;
}

const VERSES_BY_CATEGORY: Record<string, Verse[]> = {
  health: [
    { text: "He heals the brokenhearted and binds up their wounds.", reference: "Psalm 147:3" },
    { text: "Heal me, Lord, and I will be healed; save me and I will be saved, for you are the one I praise.", reference: "Jeremiah 17:14" },
    { text: "The Lord sustains them on their sickbed and restores them from their bed of illness.", reference: "Psalm 41:3" },
    { text: "My flesh and my heart may fail, but God is the strength of my heart and my portion forever.", reference: "Psalm 73:26" },
  ],
  family: [
    { text: "Carry each other's burdens, and in this way you will fulfill the law of Christ.", reference: "Galatians 6:2" },
    { text: "Above all, love each other deeply, because love covers over a multitude of sins.", reference: "1 Peter 4:8" },
    { text: "Be completely humble and gentle; be patient, bearing with one another in love.", reference: "Ephesians 4:2" },
    { text: "How good and pleasant it is when God's people live together in unity.", reference: "Psalm 133:1" },
  ],
  grief: [
    { text: "The Lord is close to the brokenhearted and saves those who are crushed in spirit.", reference: "Psalm 34:18" },
    { text: "Blessed are those who mourn, for they will be comforted.", reference: "Matthew 5:4" },
    { text: "He will wipe every tear from their eyes. There will be no more death or mourning or crying or pain.", reference: "Revelation 21:4" },
    { text: "Even though I walk through the darkest valley, I will fear no evil, for you are with me.", reference: "Psalm 23:4" },
    { text: "Cast your cares on the Lord and he will sustain you.", reference: "Psalm 55:22" },
  ],
  finances: [
    { text: "And my God will meet all your needs according to the riches of his glory in Christ Jesus.", reference: "Philippians 4:19" },
    { text: "The Lord is my shepherd, I lack nothing.", reference: "Psalm 23:1" },
    { text: "Give, and it will be given to you. A good measure, pressed down, shaken together and running over.", reference: "Luke 6:38" },
    { text: "Do not worry about your life, what you will eat or drink. Is not life more than food?", reference: "Matthew 6:25" },
  ],
  inner_struggle: [
    { text: "Come to me, all you who are weary and burdened, and I will give you rest.", reference: "Matthew 11:28" },
    { text: "Peace I leave with you; my peace I give you. Do not let your hearts be troubled and do not be afraid.", reference: "John 14:27" },
    { text: "The Spirit helps us in our weakness. We do not know what we ought to pray for, but the Spirit himself intercedes for us.", reference: "Romans 8:26" },
    { text: "Be still, and know that I am God.", reference: "Psalm 46:10" },
    { text: "When anxiety was great within me, your consolation brought me joy.", reference: "Psalm 94:19" },
  ],
  work: [
    { text: "Whatever you do, work at it with all your heart, as working for the Lord.", reference: "Colossians 3:23" },
    { text: "Commit to the Lord whatever you do, and he will establish your plans.", reference: "Proverbs 16:3" },
    { text: "I can do all this through him who gives me strength.", reference: "Philippians 4:13" },
    { text: "The Lord will fulfill his purpose for me.", reference: "Psalm 138:8" },
  ],
  school: [
    { text: "If any of you lacks wisdom, you should ask God, who gives generously to all.", reference: "James 1:5" },
    { text: "Whatever you do, work at it with all your heart, as working for the Lord.", reference: "Colossians 3:23" },
    { text: "I can do all this through him who gives me strength.", reference: "Philippians 4:13" },
    { text: "The Lord will fulfill his purpose for me.", reference: "Psalm 138:8" },
  ],
  work_school: [
    { text: "Whatever you do, work at it with all your heart, as working for the Lord.", reference: "Colossians 3:23" },
    { text: "Commit to the Lord whatever you do, and he will establish your plans.", reference: "Proverbs 16:3" },
    { text: "If any of you lacks wisdom, you should ask God, who gives generously to all.", reference: "James 1:5" },
    { text: "I can do all this through him who gives me strength.", reference: "Philippians 4:13" },
  ],
  other: [
    { text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you.", reference: "Jeremiah 29:11" },
    { text: "Trust in the Lord with all your heart and lean not on your own understanding.", reference: "Proverbs 3:5" },
    { text: "The Lord is my light and my salvation — whom shall I fear?", reference: "Psalm 27:1" },
    { text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you.", reference: "Joshua 1:9" },
    { text: "In all things God works for the good of those who love him.", reference: "Romans 8:28" },
  ],
};

export function getRandomVerse(category: string): Verse {
  const verses = VERSES_BY_CATEGORY[category] ?? VERSES_BY_CATEGORY.other;
  return verses[Math.floor(Math.random() * verses.length)];
}
