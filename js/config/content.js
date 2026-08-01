export const PROFILE = {
  name: 'Kenny Shao',
  role: 'Computer Science student · Full-stack developer · AI/ML builder',
  school: 'Florida International University',
  email: 'KennyShao0919@gmail.com',
  github: 'https://github.com/Kshao09',
  linkedin: 'https://www.linkedin.com/in/kenny-shao-429363219/',
  summary: 'I build practical web systems and keep pushing them toward intelligent, useful products. I enjoy the point where interface design, backend engineering, data, and machine learning meet.',
  interests: ['Artificial intelligence', 'Machine learning', 'Agentic workflows', 'RAG systems', 'Robotics', 'Full-stack product development']
};

export const SKILLS = [
  { label: 'UI / UX', score: 92, note: 'HTML, CSS, JavaScript, React, responsive interaction design' },
  { label: 'Backend + DB', score: 88, note: 'Java, Python, MySQL, SQL Server, API integration' },
  { label: 'AI / ML', score: 76, note: 'RAG, embeddings, model fundamentals, experimentation' },
  { label: 'Cloud / AWS', score: 68, note: 'Deploying and connecting services beyond localhost' }
];

export const PROJECTS = [
  {
    id: 'resolve-ai',
    title: 'ResolveAI Incident Copilot',
    type: 'Agentic AI / RAG',
    description: 'A ServiceNow incident-assistance workflow connected to an external FastAPI retrieval service. It retrieves grounded evidence, generates an answer, and records the execution trail for review.',
    stack: ['ServiceNow', 'FastAPI', 'Python', 'RAG', 'Embeddings'],
    links: [
      { label: 'RAG service', href: 'https://github.com/Kshao09/ResolveAI-RAG-Service' },
      { label: 'ServiceNow project', href: 'https://github.com/Kshao09/ResolveAI-ServiceNow' }
    ]
  },
  {
    id: 'quiz-app',
    title: 'Interactive Quiz Application',
    type: 'Frontend systems',
    description: 'A component-driven quiz experience that scores answers in real time and turns application state into immediate user feedback.',
    stack: ['JavaScript', 'React', 'State management'],
    links: [{ label: 'GitHub profile', href: PROFILE.github }]
  },
  {
    id: 'database-app',
    title: 'Database-backed Web App',
    type: 'Full-stack engineering',
    description: 'A web application connected to a relational database for structured, secure, and maintainable data access.',
    stack: ['Java', 'Python', 'SQL Server', 'MySQL'],
    links: [{ label: 'GitHub profile', href: PROFILE.github }]
  },
  {
    id: 'ai-world',
    title: 'AI World Portfolio',
    type: 'Creative web graphics',
    description: 'This playable portfolio: a procedural Three.js world with a controllable avatar, collectible knowledge nodes, contextual interactions, and multiple AI/ML-inspired biomes.',
    stack: ['Three.js', 'WebGL', 'JavaScript modules', 'CSS UI'],
    links: [{ label: 'GitHub profile', href: PROFILE.github }]
  }
];

export const ZONES = [
  { id: 'hub', name: 'Inference Hub', center: [0, 0, 8], radius: 12, color: '#5ff7df', quest: 'Find the glowing model-card beacon.' },
  { id: 'neural', name: 'Neural Forest', center: [-24, 0, -8], radius: 14, color: '#8c7cff', quest: 'Inspect the capability tree and collect nearby nodes.' },
  { id: 'data', name: 'Data Lake', center: [24, 0, -8], radius: 14, color: '#54c6ff', quest: 'Read the backend terminal beside the data stream.' },
  { id: 'lab', name: 'Project Lab', center: [0, 0, -30], radius: 16, color: '#ffb75e', quest: 'Open the project terminals around the lab.' },
  { id: 'cloud', name: 'Cloud Ridge', center: [25, 0, 24], radius: 14, color: '#70f59a', quest: 'Reach the cloud beacon and scan the floating architecture.' },
  { id: 'portal', name: 'Contact Portal', center: [-25, 0, 24], radius: 14, color: '#ff6f91', quest: 'Activate the portal to connect with Kenny.' }
];

const skillRows = SKILLS.map(skill => `
  <div class="skill-row">
    <span>${skill.label}</span>
    <div class="skill-track"><i style="width:${skill.score}%"></i></div>
    <b>${skill.score}%</b>
  </div>`).join('');

const projectPanel = project => ({
  kicker: project.type,
  title: project.title,
  body: `
    <p>${project.description}</p>
    <div class="project-meta">${project.stack.map(item => `<span>${item}</span>`).join('')}</div>
    <h3>What this terminal represents</h3>
    <p>Each project station is a concrete example of turning a technical idea into an experience that another person can use, inspect, and evaluate.</p>`,
  actions: project.links
});

export const INTERACTIONS = [
  {
    id: 'about',
    zone: 'hub',
    label: 'Open Kenny\'s model card',
    position: [0, 0, 3],
    color: '#5ff7df',
    panel: {
      kicker: 'MODEL CARD // ABOUT',
      title: PROFILE.name,
      body: `
        <p><strong>${PROFILE.role}</strong></p>
        <p>${PROFILE.summary}</p>
        <div class="stat-grid">
          <div class="stat-card"><span>Current training ground</span><strong>${PROFILE.school}</strong></div>
          <div class="stat-card"><span>Primary mode</span><strong>Build → test → improve</strong></div>
        </div>
        <h3>Areas of interest</h3>
        <ul>${PROFILE.interests.map(item => `<li>${item}</li>`).join('')}</ul>
        <p><code>known_limitation:</code> still training; accuracy improves with coffee.</p>`,
      actions: [
        { label: 'Email Kenny', href: `mailto:${PROFILE.email}` },
        { label: 'LinkedIn', href: PROFILE.linkedin },
        { label: 'GitHub', href: PROFILE.github }
      ]
    }
  },
  {
    id: 'skills',
    zone: 'neural',
    label: 'Inspect capability tree',
    position: [-24, 0, -8],
    color: '#8c7cff',
    panel: {
      kicker: 'NEURAL FOREST // CAPABILITIES',
      title: 'Capability Matrix',
      body: `
        <p>The forest visualizes a growing skill graph: established branches, active learning paths, and new connections that become stronger through projects.</p>
        <div class="skill-list">${skillRows}</div>
        <p>These values are self-reported confidence signals rather than formal benchmarks.</p>`,
      actions: [{ label: 'View GitHub', href: PROFILE.github }]
    }
  },
  {
    id: 'backend',
    zone: 'data',
    label: 'Query backend terminal',
    position: [24, 0, -8],
    color: '#54c6ff',
    panel: {
      kicker: 'DATA LAKE // SYSTEMS',
      title: 'Backend + Data',
      body: `
        <p>Kenny works across the layers that turn interfaces into complete systems: APIs, service logic, databases, integration, and operational workflows.</p>
        <div class="stat-grid">
          <div class="stat-card"><span>Languages</span><strong>Java · Python · JavaScript</strong></div>
          <div class="stat-card"><span>Data systems</span><strong>MySQL · SQL Server</strong></div>
          <div class="stat-card"><span>Integration</span><strong>REST · FastAPI · ServiceNow</strong></div>
          <div class="stat-card"><span>Current direction</span><strong>Grounded AI systems</strong></div>
        </div>
        <p>The animated cubes represent structured records. The rising particles represent data becoming context for a decision.</p>`,
      actions: [{ label: 'View GitHub', href: PROFILE.github }]
    }
  },
  ...PROJECTS.map((project, index) => ({
    id: `project-${project.id}`,
    zone: 'lab',
    label: `Open ${project.title}`,
    position: [[-7,0,-29], [7,0,-29], [-7,0,-36], [7,0,-36]][index],
    color: ['#ffb75e','#ff6f91','#8c7cff','#5ff7df'][index],
    panel: projectPanel(project)
  })),
  {
    id: 'cloud',
    zone: 'cloud',
    label: 'Inspect cloud roadmap',
    position: [25, 0, 24],
    color: '#70f59a',
    panel: {
      kicker: 'CLOUD RIDGE // NEXT LAYER',
      title: 'Deployment Roadmap',
      body: `
        <p>This ridge represents the transition from local prototypes to systems that can be deployed, observed, and improved in real environments.</p>
        <ul>
          <li>Package services cleanly and document reproducible setup.</li>
          <li>Deploy APIs and front ends with sensible security boundaries.</li>
          <li>Measure retrieval quality, latency, and failure modes.</li>
          <li>Keep learning AWS fundamentals through complete projects.</li>
        </ul>`,
      actions: [{ label: 'View GitHub', href: PROFILE.github }]
    }
  },
  {
    id: 'contact',
    zone: 'portal',
    label: 'Activate contact portal',
    position: [-25, 0, 24],
    color: '#ff6f91',
    panel: {
      kicker: 'CONTACT PORTAL // OPEN CHANNEL',
      title: 'Let\'s Connect',
      body: `
        <p>Kenny is interested in internships and entry-level opportunities where he can build real features, work with data, and keep developing practical AI/ML systems.</p>
        <div class="stat-grid">
          <div class="stat-card"><span>Email</span><strong>${PROFILE.email}</strong></div>
          <div class="stat-card"><span>Location</span><strong>Miami, Florida</strong></div>
        </div>`,
      actions: [
        { label: 'Send email', href: `mailto:${PROFILE.email}` },
        { label: 'LinkedIn', href: PROFILE.linkedin },
        { label: 'GitHub', href: PROFILE.github }
      ]
    }
  }
];

export const COLLECTIBLES = [
  { id: 'node-01', position: [-8, 1.2, 8], message: 'HTML + semantic structure' },
  { id: 'node-02', position: [-28, 1.5, -2], message: 'Machine-learning fundamentals' },
  { id: 'node-03', position: [-18, 1.3, -15], message: 'Neural-network intuition' },
  { id: 'node-04', position: [18, 1.2, -4], message: 'Relational data modeling' },
  { id: 'node-05', position: [30, 1.5, -13], message: 'API integration' },
  { id: 'node-06', position: [0, 1.3, -21], message: 'Project iteration' },
  { id: 'node-07', position: [30, 2.2, 19], message: 'Cloud deployment' },
  { id: 'node-08', position: [-19, 1.5, 28], message: 'Communication + collaboration' }
];
