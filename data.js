// Starting content, drawn from my first brain-dump. Everything here is
// editable in the app; this only seeds a fresh install (or a reset).

const SEED = {
  version: 1,

  categories: [
    { id: 'faith', name: 'Faith & Spirit' },
    { id: 'character', name: 'Character' },
    { id: 'marriage', name: 'Marriage & Roles' },
    { id: 'us', name: 'Friendship & Chemistry' },
    { id: 'family', name: 'Family Background' },
    { id: 'life', name: 'Health & Rhythms' },
  ],

  // priority: 'essential' | 'important' | 'preference'
  values: [
    {
      id: 'v-loves-god', category: 'faith', priority: 'essential',
      title: 'Deep woman of faith who loves God deeply',
      desc: 'Her love for Jesus is the center of her life, not a part of it.',
      lookFor: 'What does she do with her time alone with God? How does she talk about Him when no one is prompting her? Is her faith hers, or inherited?',
    },
    {
      id: 'v-gentle-quiet', category: 'faith', priority: 'essential',
      title: 'A gentle and quiet spirit',
      desc: 'Peaceful, calm, unhurried in spirit. (1 Peter 3:4)',
      lookFor: 'How does she respond when things go wrong, or when she is disagreed with? Is she at rest, or restless?',
    },
    {
      id: 'v-missional', category: 'faith', priority: 'essential',
      title: 'Missionally inclined',
      desc: 'She believes her life is built to serve Jesus, and wants to be part of kingdom work.',
      lookFor: 'Is she already serving somewhere without being asked? Does she light up talking about the mission, or only about comfort?',
    },
    {
      id: 'v-theology', category: 'faith', priority: 'important',
      title: 'Can talk theology with a rich, Christ-centered bent',
      desc: 'I can fully express myself theologically with her, and she brings depth back.',
      lookFor: 'What is she reading? Can we go deep on Scripture and both walk away sharpened?',
    },
    {
      id: 'v-worldview', category: 'faith', priority: 'essential',
      title: 'Christ-centered view of justice, not a woke one',
      desc: 'Not racist in any way, but her understanding of justice and people comes from Scripture rather than a liberal social-justice framework (e.g. BLM activism).',
      lookFor: 'Where does she go for her convictions on hard cultural issues — Scripture or the culture? What does she share and amplify?',
    },
    {
      id: 'v-serving', category: 'character', priority: 'essential',
      title: 'Serving heart and a hard worker',
      desc: 'Diligent, sees what needs to be done and does it. (Proverbs 31)',
      lookFor: 'Watch her at church events, at home, with family. Does she jump in or wait to be asked?',
    },
    {
      id: 'v-lay-down', category: 'character', priority: 'important',
      title: 'Peaceful and willing to lay herself down',
      desc: 'Willing to serve and lay herself down for me and our family.',
      lookFor: 'How does she handle not getting her way? Does she serve people who can\'t give anything back?',
    },
    {
      id: 'v-loyal', category: 'character', priority: 'essential',
      title: 'Loyal and faithful',
      desc: 'She never gives me reason to be concerned or question her faithfulness.',
      lookFor: 'How does she talk about past relationships and friends? How does she carry herself with other men?',
    },
    {
      id: 'v-shepherd', category: 'character', priority: 'important',
      title: 'Shepherds other women well',
      desc: 'Wise, not a toxic-empathy kind of care. Her husband and kids still come first.',
      lookFor: 'Do younger women seek her out? Does she speak truth in love, or just affirm?',
    },
    {
      id: 'v-normal', category: 'character', priority: 'preference',
      title: 'Normal, not weird',
      desc: 'Enjoys celebrating holidays and ordinary joys.',
      lookFor: 'Is she joyful and grounded in everyday life?',
    },
    {
      id: 'v-complementarian', category: 'marriage', priority: 'essential',
      title: 'Complementarian',
      desc: 'Shares a biblical conviction about the roles of husband and wife.',
      lookFor: 'Does she hold this as her own conviction, or is she just tolerating it?',
    },
    {
      id: 'v-follow', category: 'marriage', priority: 'essential',
      title: 'Willing to follow, with a personality of her own',
      desc: 'Quieter and chill, submissive and gentle, but not without her own voice, thoughts, and personality.',
      lookFor: 'Does she trust good leadership easily? Does she still bring her own ideas and perspective?',
    },
    {
      id: 'v-homemaker', category: 'marriage', priority: 'essential',
      title: 'Primary homemaker and keeper of the home',
      desc: 'Raising up the children is her main work. I don\'t expect her to make money; hobbies are welcome.',
      lookFor: 'Does she desire this, or see it as a sacrifice? How does she keep her own space today?',
    },
    {
      id: 'v-companion', category: 'marriage', priority: 'essential',
      title: 'My companion everywhere',
      desc: 'Travels with me in kingdom work, and brings the kids along.',
      lookFor: 'Is she adaptable and adventurous? How does she handle travel, change, and discomfort?',
    },
    {
      id: 'v-chemistry', category: 'us', priority: 'essential',
      title: 'Great natural chemistry and friendship',
      desc: 'Romance isn\'t the answer; a great friendship is.',
      lookFor: 'Is it easy? Do we laugh? Would I want to spend a boring Tuesday with her?',
    },
    {
      id: 'v-myself', category: 'us', priority: 'essential',
      title: 'I can be fully myself around her',
      desc: 'Still growing, but never performing.',
      lookFor: 'Do I feel more like myself or less around her?',
    },
    {
      id: 'v-affection', category: 'us', priority: 'important',
      title: 'Affectionate, physical touch, centered around me',
      desc: 'Mutual attraction too — held with restraint for now, not dwelt on.',
      lookFor: 'Save this for later seasons. Don\'t awaken love before it pleases. (Song of Songs 2:7)',
    },
    {
      id: 'v-family', category: 'family', priority: 'important',
      title: 'From a great, believing family',
      desc: 'Ideally lots of believing parents and siblings, people I get along with well.',
      lookFor: 'How does she honor her parents? How do her siblings talk about her?',
    },
    {
      id: 'v-fit', category: 'life', priority: 'important',
      title: 'Takes care of her body — fit and healthy',
      desc: 'Stewards her health well.',
      lookFor: 'Is this a rhythm in her life, or a phase?',
    },
    {
      id: 'v-structure', category: 'life', priority: 'important',
      title: 'Loves structure, order, and organization',
      desc: 'Enjoys things consolidated and tracked (Notion-style), weekly rhythms and scheduled check-ins on how we\'re doing and how we can grow.',
      lookFor: 'Does she already keep systems? Would weekly check-ins feel life-giving to her, not a chore?',
    },
  ],

  roles: {
    her: [
      'Primary homemaker and keeper of the home',
      'Raising up the children day to day',
      'Homeschooling (leaning toward it)',
      'Shepherding other women, after husband and kids',
      'Hobbies welcome; no expectation to earn income',
    ],
    me: [
      'Spiritual leadership of the home',
      'Provision',
      'The strength jobs',
      'Helping design and build out the home',
      'Sharing household chores',
    ],
    together: [
      'Traveling together in kingdom work, kids along',
      'Rooted in a rich church community',
      'Weekly check-ins: how are we doing, how can we grow',
      'Raising and disciplining the kids',
      'Celebrating holidays and rhythms as a family',
    ],
    questions: [
      'Practically, how do we split the home work so she can travel with me?',
      'How does homeschooling work alongside travel and ministry?',
      'Who does a healthy family and a missional life well? Learn from them.',
    ],
  },

  vision: {
    kids: [
      'Love Jesus and make real impact for Christ',
      'Well disciplined',
      'Love their father',
      'Self-sustaining, likely some form of entrepreneurs',
      'Marry well',
      'Like the kids at Shore Break: really impressive children',
    ],
    family: [
      'Homeschooling, supported by a rich church community',
      'Kids come along in the mission',
      'Weekly rhythms and check-ins, consolidated and tracked',
    ],
    models: [
      'NPL families: healthy families that are also missionally oriented',
      'Shore Break families',
    ],
    me: [
      'Keep growing in Christ, not waiting to be "ready"',
      'Be the kind of man this kind of woman would want to follow',
      'Build the rhythms now that I want in our home later',
    ],
  },

  reflections: [],
};

const VERSES = {
  values: 'Charm is deceitful, and beauty is vain, but a woman who fears the Lord is to be praised. — Prov 31:30',
  roles: 'Unless the Lord builds the house, those who build it labor in vain. — Ps 127:1',
  vision: 'The heart of man plans his way, but the Lord establishes his steps. — Prov 16:9',
  reflect: 'By their fruits you will recognize them. — Matt 7:20',
  more: 'If the Lord wills, we will live and do this or that. — James 4:15',
};
