export interface Person {
  id: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  padreId?: string;
  madreId?: string;
  position: {
    x: number;
    y: number;
  };
}