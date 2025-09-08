// Generic Page interface
export default interface Page<T> {
  content: T;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}