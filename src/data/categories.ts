export const CATEGORIES = [
  {
    slug: 'java-spring',
    name: 'Java · Spring',
    description: 'Java, Spring MVC, Spring Boot와 백엔드 동작 원리를 다룹니다.',
  },
  {
    slug: 'javascript-frontend',
    name: 'JavaScript · Frontend',
    description: 'JavaScript, 브라우저와 사용자 입력 문제를 다룹니다.',
  },
  {
    slug: 'project-retrospective',
    name: 'Project · Retrospective',
    description: '직접 만든 프로젝트의 설계, 구현과 성장 과정을 돌아봅니다.',
  },
] as const;

export type CategoryName = (typeof CATEGORIES)[number]['name'];

export function getCategoryByName(name: string) {
  return CATEGORIES.find(category => category.name === name);
}

