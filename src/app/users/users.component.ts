import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { UserService } from '../../services/user.service';
import { User } from '../../model/user';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent {

  displayedColumns: string[] = ['lastName', 'firstName', 'mailAddress', 'role', 'action'];
  dataSource: User[] = [];  

  responseMessage: string = "";

  userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  ngOnInit(): void {
    this.userService.getAllUsers().subscribe(
      usersList => {
        this.dataSource = usersList;
      }, error => {
      });
  }

  deleteUser(mailAddress: string){
    this.userService.deleteUser(mailAddress).subscribe(
      success => {
        let count: number = 0;
        for(let user of this.dataSource){
          if(user.mailAddress === mailAddress){
            break;
          }
          count++;
        }
        let dataSourceCopy = this.dataSource.slice();
        dataSourceCopy.splice(count, 1);
        this.dataSource = dataSourceCopy;
        this.responseMessage = "Benutzer efolgreich gelöscht";
      }, (error: HttpErrorResponse) => {
        this.responseMessage = error.error;
      });
  }

}
