export const CATEGORIES = [
  {
    slug: 'backend', name: 'Backend',
    description: '서버 애플리케이션, 데이터 처리와 백엔드 설계를 다룹니다.',
    subcategories: [
      { slug: 'java', name: 'Java' }, { slug: 'spring', name: 'Spring' },
      { slug: 'python', name: 'Python' }, { slug: 'database', name: 'Database' },
      { slug: 'api-architecture', name: 'API · Architecture' },
    ],
  },
  {
    slug: 'frontend', name: 'Frontend',
    description: '브라우저, UI 프레임워크와 사용자 입력 문제를 다룹니다.',
    subcategories: [
      { slug: 'javascript', name: 'JavaScript' }, { slug: 'react', name: 'React' },
      { slug: 'vue', name: 'Vue' }, { slug: 'nexacro', name: 'Nexacro' },
      { slug: 'websquare', name: 'WebSquare' },
    ],
  },
  {
    slug: 'devops', name: 'DevOps',
    description: '빌드, 배포 자동화와 서비스를 운영하는 기반 기술을 정리합니다.',
    subcategories: [
      { slug: 'ci-cd', name: 'CI/CD' }, { slug: 'docker', name: 'Docker' },
      { slug: 'cloud', name: 'Cloud' }, { slug: 'infrastructure', name: 'Infrastructure' },
    ],
  },
  {
    slug: 'tooling', name: 'Tooling',
    description: '개발 생산성과 품질을 높이는 도구와 활용법을 기록합니다.',
    subcategories: [
      { slug: 'git-github', name: 'Git · GitHub' }, { slug: 'ide', name: 'IDE' },
      { slug: 'testing', name: 'Testing' }, { slug: 'ai-codex', name: 'AI · Codex' },
    ],
  },
  {
    slug: 'cs-fundamentals', name: 'CS Fundamentals',
    description: '개발의 기반이 되는 컴퓨터 과학 개념을 정리합니다.',
    subcategories: [
      { slug: 'network', name: 'Network' }, { slug: 'operating-system', name: 'Operating System' },
      { slug: 'database-fundamentals', name: 'Database Fundamentals' },
      { slug: 'data-structure', name: 'Data Structure' },
    ],
  },
  {
    slug: 'algorithms', name: 'Algorithms',
    description: '문제 해결에 사용하는 알고리즘과 풀이 과정을 기록합니다.',
    subcategories: [
      { slug: 'implementation', name: 'Implementation' }, { slug: 'search', name: 'Search' },
      { slug: 'dynamic-programming', name: 'Dynamic Programming' },
      { slug: 'problem-solving', name: 'Problem Solving' },
    ],
  },
  {
    slug: 'projects', name: 'Projects',
    description: '직접 만든 프로젝트의 설계, 구현과 성장 과정을 돌아봅니다.',
    subcategories: [
      { slug: 'team-project', name: 'Team Project' },
      { slug: 'personal-project', name: 'Personal Project' },
      { slug: 'retrospective', name: 'Retrospective' },
    ],
  },
] as const;

export type CategoryName = (typeof CATEGORIES)[number]['name'];

export function getCategoryByName(name: string) {
  return CATEGORIES.find(category => category.name === name);
}

export function getCategoryBySlug(slug: string) {
  return CATEGORIES.find(category => category.slug === slug);
}

export function getSubcategoryByName(categoryName: string, subcategoryName: string) {
  return getCategoryByName(categoryName)?.subcategories.find(subcategory => subcategory.name === subcategoryName);
}

export function getSubcategoryBySlug(categorySlug: string, subcategorySlug: string) {
  return getCategoryBySlug(categorySlug)?.subcategories.find(subcategory => subcategory.slug === subcategorySlug);
}

export function getCategoryPath(categoryName: string, subcategoryName?: string) {
  const category = getCategoryByName(categoryName);
  if (!category) return '/categories/';
  if (!subcategoryName) return `/categories/${category.slug}/`;
  const subcategory = getSubcategoryByName(categoryName, subcategoryName);
  return subcategory ? `/categories/${category.slug}/${subcategory.slug}/` : `/categories/${category.slug}/`;
}
