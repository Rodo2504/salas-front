import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SalasService } from '../../services/salas.service';
import { ReservasService } from '../../services/reservas.service';

@Component({
  selector: 'app-salas',
  templateUrl: './salas.component.html',
  styleUrls: ['./salas.component.css']
})
export class SalasComponent implements OnInit {
  constructor(public toastr: ToastrService ,public salaService: SalasService, public reservaService: ReservasService) { }

  salas: any                     //se guardan todas las salas obtenidas
  sala_editar:any                //para guardar la sala que se va a editar
  
  form_1 = new FormGroup({                                        //form para editar sala
    nuevo_nombre: new FormControl('', Validators.required),
    nueva_capacidad: new FormControl('', Validators.required)
  });
  form_2 = new FormGroup({                                        //form para crear sala
    nombre: new FormControl('', Validators.required),
    capacidad: new FormControl('', Validators.required)
  });

  ngOnInit(): void {
    this.salaService.getSalas().subscribe(data=>{            //obtiene todas las salas
      this.salas = data         
    });  
  }
  limpiar_form1(){
    this.form_1.get('nuevo_nombre')?.setValue(''); 
    this.form_1.get('nueva_capacidad')?.setValue('');
  }
  limpiar_form2(){''
    this.form_2.get('nombre')?.setValue(''); 
    this.form_2.get('capacidad')?.setValue('');
  }
  eliminar(sala: any){     
    this.reservaService.getReservasSala(sala.Id).subscribe(data=>{                        //obtiene las reservas de esa sala
      if(sala.Estado == 'ocupada'){
        this.toastr.error(`${sala.Nombre} ocupada, no se puede eliminar`)  
      }else{
        if(Object.keys(data).length === 0){                                               //verifica que no haya reservas
          var res = confirm(`¿Desea eliminar la ${sala.Nombre}?`);
          if(res){
            this.salaService.deleteSala(sala.Id).subscribe(data=>{
              this.toastr.success("Sala eliminada");
              this.salaService.getSalas().subscribe(data=>{         //una vez eliminada, se vuelven a obtener para actualizar la vista
                this.salas = data
              });
            });            
          }
        }else{
          this.toastr.error(`${sala.Nombre} con reservaciones, no se puede eliminar`)
        }
      }
    })
  }
  editar(sala: any){  //validar que no esta ocupada
    if(sala.Estado == 'ocupada'){
      this.toastr.info(`${sala.Nombre} ocupada, no se puede editar`) 
    }else{
      this.sala_editar = sala;      //guardar la informacion de la sala que se va a editar
      this.limpiar_form1()
    }
  }
  submit_1(){     //boton para confirmar la edicion de sala
    this.salaService.sala(this.form_1.value.nuevo_nombre!).subscribe(data=>{
      if(this.form_1.value.nuevo_nombre === this.sala_editar.Nombre && this.form_1.value.nueva_capacidad === this.sala_editar.Capacidad){ //si los datos son iguales
        this.toastr.warning("Los datos son los mismos")
      }else if (this.form_1.value.nuevo_nombre === this.sala_editar.Nombre || Object.keys(data).length === 0){ //vacio, no hay sala con ese nombre enconces se puede cambiar o es el mismo nombre
        this.salaService.updateSala(this.form_1.value.nuevo_nombre!, this.form_1.value.nueva_capacidad!, this.sala_editar.Id).subscribe((data)=>{
          this.toastr.success("Sala modificada")
          this.limpiar_form1()
          this.salaService.getSalas().subscribe(data=>{         //una vez editda, se vuelven a obtener para actualizar la vista
            this.salas = data
          });
          this.sala_editar = null;
        })
      }else{ this.toastr.warning("Ya existe una sala con ese nombre") }
    });
  }
  submit_2(){     //boton para confirmar la creacion de nueva sala
    this.salaService.sala(this.form_2.value.nombre!).subscribe(data => {
      if(Object.keys(data).length === 0){         //vacio, no existe una sala con ese nombre
        this.salaService.setSala(this.form_2.value.nombre!, this.form_2.value.capacidad!, 'libre').subscribe(data=>{
          this.toastr.success("Sala registrada")
          this.limpiar_form2()
          this.salaService.getSalas().subscribe(data=>{         //una vez registrada, se vuelven a obtener para actualizar la vista
            this.salas = data
          });
        })
      }else{ this.toastr.warning("Ya existe una sala con ese nombre") }
    });
  }
}
