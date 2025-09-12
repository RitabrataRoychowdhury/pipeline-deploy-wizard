import { 
  GitBranch, 
  Code, 
  Wrench, 
  Container, 
  Globe, 
  CheckCircle, 
  Network, 
  HardDrive, 
  Server, 
  Boxes,
  Terminal,
  Package,
  TestTube,
  Rocket,
  Database,
  Cloud,
  Shield,
  Cpu,
  Archive,
  Bell,
  Mail,
  Webhook,
  Clock,
  FileText,
  Lock,
  Layers,
  Settings
} from "lucide-react";
import { ComponentCategory, ComponentDefinition } from "@/lib/pipeline-utils";

// Define all available component definitions
export const componentDefinitions: ComponentDefinition[] = [
  // Source Control Components
  {
    type: 'github-clone',
    name: 'GitHub Clone',
    description: 'Clone repository from GitHub',
    icon: GitBranch,
    category: 'source-control',
    color: 'bg-emerald-500',
    defaultConfig: {
      repository: '',
      branch: 'main',
      depth: 1,
      token: ''
    },
    tags: ['git', 'github', 'clone', 'source']
  },
  {
    type: 'gitlab-clone',
    name: 'GitLab Clone',
    description: 'Clone repository from GitLab',
    icon: GitBranch,
    category: 'source-control',
    color: 'bg-emerald-500',
    defaultConfig: {
      repository: '',
      branch: 'main',
      depth: 1,
      token: ''
    },
    tags: ['git', 'gitlab', 'clone', 'source']
  },
  {
    type: 'git-checkout',
    name: 'Git Checkout',
    description: 'Switch branches or commits',
    icon: Code,
    category: 'source-control',
    color: 'bg-emerald-500',
    defaultConfig: {
      branch: '',
      commit: '',
      createBranch: false
    },
    tags: ['git', 'checkout', 'branch', 'commit']
  },

  // Build & Compile Components
  {
    type: 'normal-build',
    name: 'Normal Build',
    description: 'Standard build process',
    icon: Wrench,
    category: 'build-compile',
    color: 'bg-blue-500',
    defaultConfig: {
      command: 'make',
      workingDirectory: '.',
      environment: {}
    },
    tags: ['build', 'compile', 'make']
  },
  {
    type: 'docker-build',
    name: 'Docker Build',
    description: 'Build Docker images',
    icon: Container,
    category: 'build-compile',
    color: 'bg-blue-500',
    defaultConfig: {
      dockerfile: 'Dockerfile',
      context: '.',
      tag: 'latest',
      buildArgs: {}
    },
    tags: ['docker', 'build', 'container', 'image']
  },
  {
    type: 'node-npm',
    name: 'Node.js NPM',
    description: 'Build Node.js with NPM',
    icon: Globe,
    category: 'build-compile',
    color: 'bg-blue-500',
    defaultConfig: {
      command: 'npm install',
      nodeVersion: '18',
      registry: 'https://registry.npmjs.org/'
    },
    tags: ['nodejs', 'npm', 'javascript', 'build']
  },
  {
    type: 'python-build',
    name: 'Python Build',
    description: 'Build Python applications',
    icon: Code,
    category: 'build-compile',
    color: 'bg-blue-500',
    defaultConfig: {
      command: 'pip install -r requirements.txt',
      pythonVersion: '3.9',
      virtualenv: true
    },
    tags: ['python', 'pip', 'build', 'virtualenv']
  },

  // Testing Components
  {
    type: 'unit-tests',
    name: 'Unit Tests',
    description: 'Run unit tests',
    icon: CheckCircle,
    category: 'testing',
    color: 'bg-purple-500',
    defaultConfig: {
      command: 'npm test',
      coverage: true,
      reportFormat: 'junit'
    },
    tags: ['test', 'unit', 'coverage', 'junit']
  },
  {
    type: 'integration-tests',
    name: 'Integration Tests',
    description: 'Run integration tests',
    icon: Network,
    category: 'testing',
    color: 'bg-purple-500',
    defaultConfig: {
      command: 'npm run test:integration',
      timeout: 300,
      parallel: false
    },
    tags: ['test', 'integration', 'e2e']
  },
  {
    type: 'security-scan',
    name: 'Security Scan',
    description: 'Run security vulnerability scans',
    icon: Shield,
    category: 'testing',
    color: 'bg-purple-500',
    defaultConfig: {
      tool: 'npm audit',
      severity: 'high',
      failOnVulnerabilities: true
    },
    tags: ['security', 'scan', 'vulnerability', 'audit']
  },

  // Deployment Components
  {
    type: 'deploy-local',
    name: 'Local Deploy',
    description: 'Deploy to local server',
    icon: HardDrive,
    category: 'deployment',
    color: 'bg-red-500',
    defaultConfig: {
      path: '/var/www/html',
      user: 'www-data',
      permissions: '755'
    },
    tags: ['deploy', 'local', 'server']
  },
  {
    type: 'deploy-ssh',
    name: 'SSH Deploy',
    description: 'Deploy via SSH',
    icon: Server,
    category: 'deployment',
    color: 'bg-red-500',
    defaultConfig: {
      host: '',
      user: '',
      port: 22,
      path: '/var/www/html',
      keyFile: ''
    },
    tags: ['deploy', 'ssh', 'remote', 'server']
  },
  {
    type: 'deploy-k8s',
    name: 'Kubernetes Deploy',
    description: 'Deploy to Kubernetes cluster',
    icon: Boxes,
    category: 'deployment',
    color: 'bg-red-500',
    defaultConfig: {
      namespace: 'default',
      deployment: '',
      image: '',
      replicas: 1
    },
    tags: ['deploy', 'kubernetes', 'k8s', 'container']
  },
  {
    type: 'deploy-cloud',
    name: 'Cloud Deploy',
    description: 'Deploy to cloud platform',
    icon: Cloud,
    category: 'deployment',
    color: 'bg-red-500',
    defaultConfig: {
      provider: 'aws',
      region: 'us-east-1',
      service: '',
      configuration: {}
    },
    tags: ['deploy', 'cloud', 'aws', 'azure', 'gcp']
  },

  // Utilities Components
  {
    type: 'shell-command',
    name: 'Shell Command',
    description: 'Execute custom shell commands',
    icon: Terminal,
    category: 'utilities',
    color: 'bg-gray-500',
    defaultConfig: {
      command: '',
      shell: '/bin/bash',
      workingDirectory: '.',
      timeout: 300
    },
    tags: ['shell', 'command', 'script', 'bash']
  },
  {
    type: 'file-operations',
    name: 'File Operations',
    description: 'Copy, move, or delete files',
    icon: FileText,
    category: 'utilities',
    color: 'bg-gray-500',
    defaultConfig: {
      operation: 'copy',
      source: '',
      destination: '',
      recursive: false
    },
    tags: ['file', 'copy', 'move', 'delete']
  },
  {
    type: 'environment-setup',
    name: 'Environment Setup',
    description: 'Set up environment variables',
    icon: Settings,
    category: 'utilities',
    color: 'bg-gray-500',
    defaultConfig: {
      variables: {},
      file: '.env',
      override: false
    },
    tags: ['environment', 'variables', 'config', 'setup']
  },
  {
    type: 'notification',
    name: 'Notification',
    description: 'Send notifications',
    icon: Bell,
    category: 'utilities',
    color: 'bg-gray-500',
    defaultConfig: {
      type: 'email',
      recipients: [],
      message: '',
      onFailure: true
    },
    tags: ['notification', 'email', 'slack', 'webhook']
  },

  // Database Components
  {
    type: 'database-migration',
    name: 'Database Migration',
    description: 'Run database migrations',
    icon: Database,
    category: 'database',
    color: 'bg-yellow-500',
    defaultConfig: {
      type: 'postgresql',
      host: 'localhost',
      port: 5432,
      database: '',
      migrations: './migrations'
    },
    tags: ['database', 'migration', 'sql', 'schema']
  },
  {
    type: 'database-backup',
    name: 'Database Backup',
    description: 'Create database backups',
    icon: Archive,
    category: 'database',
    color: 'bg-yellow-500',
    defaultConfig: {
      type: 'postgresql',
      host: 'localhost',
      port: 5432,
      database: '',
      destination: './backups'
    },
    tags: ['database', 'backup', 'dump', 'restore']
  }
];

// Group components by category
export const componentCategories: ComponentCategory[] = [
  {
    id: 'source-control',
    name: 'Source Control',
    icon: GitBranch,
    color: 'bg-emerald-500',
    components: componentDefinitions.filter(c => c.category === 'source-control')
  },
  {
    id: 'build-compile',
    name: 'Build & Compile',
    icon: Wrench,
    color: 'bg-blue-500',
    components: componentDefinitions.filter(c => c.category === 'build-compile')
  },
  {
    id: 'testing',
    name: 'Testing',
    icon: TestTube,
    color: 'bg-purple-500',
    components: componentDefinitions.filter(c => c.category === 'testing')
  },
  {
    id: 'deployment',
    name: 'Deployment',
    icon: Rocket,
    color: 'bg-red-500',
    components: componentDefinitions.filter(c => c.category === 'deployment')
  },
  {
    id: 'database',
    name: 'Database',
    icon: Database,
    color: 'bg-yellow-500',
    components: componentDefinitions.filter(c => c.category === 'database')
  },
  {
    id: 'utilities',
    name: 'Utilities',
    icon: Layers,
    color: 'bg-gray-500',
    components: componentDefinitions.filter(c => c.category === 'utilities')
  }
];

// Helper function to get component definition by type
export const getComponentDefinition = (type: string): ComponentDefinition | undefined => {
  return componentDefinitions.find(def => def.type === type);
};

// Helper function to get category by id
export const getComponentCategory = (categoryId: string): ComponentCategory | undefined => {
  return componentCategories.find(cat => cat.id === categoryId);
};

// Helper function to search components
export const searchComponents = (query: string): ComponentDefinition[] => {
  const lowercaseQuery = query.toLowerCase();
  return componentDefinitions.filter(component =>
    component.name.toLowerCase().includes(lowercaseQuery) ||
    component.description.toLowerCase().includes(lowercaseQuery) ||
    component.type.toLowerCase().includes(lowercaseQuery) ||
    component.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};