export const ROLE_TEMPLATES = {
  general: {
    label: 'General / Other',
    summary: 'Experienced professional with a proven track record of delivering high-quality results. Skilled in project management, team collaboration, and strategic problem-solving...',
    jobTitle: 'Professional',
    skillPrompt: 'Type a skill...',
    suggestions: ['Communication', 'Leadership', 'Project Management', 'Problem Solving', 'Teamwork', 'Time Management'],
    expPosition: 'Team Lead',
    expDesc: '• Led a team to consistently meet quarterly goals...\n• Improved process efficiency by 15%...',
    projName: 'Process Optimization',
    projTech: 'MS Office, Trello',
    projDesc: 'Streamlined daily operations reducing turnaround time.'
  },
  webdev: {
    label: 'Web Developer',
    summary: 'Passionate Web Developer with 3+ years of experience building responsive, performant user interfaces using modern JavaScript frameworks like React. Strong foundation in web accessibility and scalable architectures...',
    jobTitle: 'Software Engineer',
    skillPrompt: 'React, Node.js, TypeScript...',
    suggestions: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'CSS/SASS', 'HTML5', 'Git', 'REST APIs', 'SQL', 'MongoDB', 'Next.js'],
    expPosition: 'Frontend Developer',
    expDesc: '• Built and maintained a complex React SPA serving 10k+ daily users...\n• Decreased page load times by 30% via lazy-loading and asset optimization...',
    projName: 'E-Commerce Dashboard',
    projTech: 'React, Redux, Node.js',
    projDesc: 'A full-stack dashboard for merchants to manage inventory and sales analytics in real-time.'
  },
  data: {
    label: 'Data Analyst',
    summary: 'Detail-oriented Data Analyst proficient in extracting actionable insights from complex datasets. Experienced with SQL, Python, and Tableau to build interactive dashboards that drive business decisions...',
    jobTitle: 'Data Analyst',
    skillPrompt: 'Python, SQL, Tableau...',
    suggestions: ['Python', 'SQL', 'Tableau', 'Power BI', 'Excel', 'Data Modeling', 'Statistics', 'R', 'Pandas'],
    expPosition: 'Data Analyst',
    expDesc: '• Analyzed retail data trends to uncover a $50k revenue opportunity...\n• Designed automated weekly reporting dashboards using Power BI and SQL...',
    projName: 'Customer Churn Tracker',
    projTech: 'Python (Pandas), Tableau',
    projDesc: 'Built a predictive model identifying at-risk customers, reducing churn by 5%.'
  },
  marketing: {
    label: 'Marketing / SEO',
    summary: 'Creative Digital Marketer with 4 years of experience executing data-driven SEO strategies and multi-channel campaigns. Adept at increasing organic traffic and boosting conversion rates...',
    jobTitle: 'Digital Marketing Specialist',
    skillPrompt: 'SEO, Google Analytics, Copywriting...',
    suggestions: ['SEO/SEM', 'Google Analytics', 'Content Strategy', 'Social Media', 'Email Marketing', 'Copywriting', 'A/B Testing', 'HubSpot'],
    expPosition: 'Marketing Coordinator',
    expDesc: '• Managed a monthly ad spend of $10,000 resulting in a 150% ROAS...\n• Grew organic search traffic by 40% over 6 months via targeted keyword strategies...',
    projName: 'Holiday Ad Campaign',
    projTech: 'Google Ads, Meta Ads',
    projDesc: 'Conceptualized and ran a multi-channel campaign driving a 20% YOY sales increase.'
  },
  design: {
    label: 'UI/UX Designer',
    summary: 'Creative and user-centric UI/UX Designer with a strong portfolio showcasing responsive web and mobile application designs. Expert in Figma, wireframing, user research, and creating intuitive user journeys...',
    jobTitle: 'UI/UX Designer',
    skillPrompt: 'Figma, Adobe XD, Wireframing...',
    suggestions: ['Figma', 'Adobe Creative Suite', 'Wireframing', 'Prototyping', 'User Research', 'Usability Testing', 'Interaction Design', 'HTML/CSS Basics'],
    expPosition: 'Product Designer',
    expDesc: '• Redesigned the core onboarding flow, increasing user retention by 25%...\n• Conducted A/B testing and user interviews to iterate on wireframes...',
    projName: 'Fintech Mobile App Redesign',
    projTech: 'Figma, Zeplin, Miro',
    projDesc: 'Led end-to-end design for a personal finance tracker, simplifying complex data visualization.'
  },
  sales: {
    label: 'Sales / Business Dev',
    summary: 'Results-driven Sales Professional with a proven record of exceeding quotas and building long-lasting B2B relationships. Skilled in negotiation, account management, and consultative selling...',
    jobTitle: 'Account Executive',
    skillPrompt: 'B2B Sales, CRM, Negotiation...',
    suggestions: ['B2B Sales', 'CRM (Salesforce)', 'Cold Calling', 'Negotiation', 'Account Management', 'Lead Generation', 'Client Relations', 'Pipeline Management'],
    expPosition: 'Sales Manager',
    expDesc: '• Consistently exceeded annual sales targets by 120%...\n• Managed a portfolio of 50+ enterprise accounts and successfully upsold software packages...',
    projName: 'Market Expansion Initiative',
    projTech: 'Salesforce, LinkedIn Sales Navigator',
    projDesc: 'Spearheaded outreach to the healthcare vertical, generating $500k in new pipeline within 3 months.'
  },
  product: {
    label: 'Product Manager',
    summary: 'Strategic Product Manager with 5+ years of experience leading cross-functional engineering and design teams. Passionate about agile methodologies, product roadmapping, and delivering user value...',
    jobTitle: 'Product Manager',
    skillPrompt: 'Agile, Roadmap, Jira...',
    suggestions: ['Product Strategy', 'Agile/Scrum', 'Roadmapping', 'Jira/Confluence', 'Data Analysis', 'Stakeholder Management', 'User Stories', 'Market Research'],
    expPosition: 'Product Manager',
    expDesc: '• Launched 3 major feature updates that increased monthly active users by 15%...\n• Prioritized product backlog balancing engineering constraints and business requirements...',
    projName: 'SaaS Mobile App Launch',
    projTech: 'Jira, Amplitude, Slack',
    projDesc: 'Managed the MVP release of our iOS companion app from conceptualization to App Store deployment.'
  },
  support: {
    label: 'Customer Support',
    summary: 'Empathetic Customer Success Specialist adept at resolving complex user issues, onboarding new clients, and reducing churn. Excellent communication skills with a focus on maintaining high customer satisfaction (CSAT) scores...',
    jobTitle: 'Customer Success Manager',
    skillPrompt: 'Zendesk, Communication, Troubleshooting...',
    suggestions: ['Customer Service', 'Zendesk / Intercom', 'Conflict Resolution', 'Onboarding', 'Technical Troubleshooting', 'Communication', 'Time Management'],
    expPosition: 'Customer Support Representative',
    expDesc: '• Handled 50+ daily support tickets while maintaining a 98% CSAT score...\n• Created comprehensive help center documentation to reduce repeat inquiries by 10%...',
    projName: 'Support Article Knowledgebase',
    projTech: 'Zendesk Guide',
    projDesc: 'Wrote and published over 30 technical FAQs for the new product rollout.'
  }
};
