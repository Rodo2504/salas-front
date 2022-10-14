import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SalasService {
  constructor(private http: HttpClient) { }

  url = 'https://api-salas.herokuapp.com';

  getSalas(){
    return this.http.get(`${this.url}/salas`);
  }
  sala(nom:string){               //funcion para validar si ya existe una sala con tal nombre
    //const body = new HttpParams().set('Nombre', nom);     
    const body = {'Nombre': nom}                            
    return this.http.post(`${this.url}/validarSala`, body);
  }
  deleteSala(id:string){          //funcion para eliminar sala con ayuda del id
    return this.http.delete(`${this.url}/sala/${id}`);
  }
  setSala(nom:string, cap:string, estado:string){
    //const body = new HttpParams().set('Nombre',nom).set('Capacidad',cap.toString()).set('Estado',estado);
    const body = {'Nombre': nom, 'Capacidad': cap, 'Estado':estado};
    return this.http.post(`${this.url}/sala`, body);
  }
  updateSala(nom:string, cap:string, id:string){
    //const body = new HttpParams().set('Nombre', nom).set('Capacidad', cap.toString());
    const body = {'Nombre': nom, 'Capacidad':cap.toString()}
    return this.http.put(`${this.url}/sala/${id}`, body);
  }
  updateSalaStatus(est:string, id:string){
    //const body = new HttpParams().set('Estado', est);
    const body = {'Estado': est};
    return this.http.put(`${this.url}/estado/${id}`, body);
  }
}
