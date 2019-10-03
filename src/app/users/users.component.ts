import { Component, OnInit } from '@angular/core';
import { User } from '../Models/User';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { PostForCreation } from '../Models/PostForCreation';
import { UserForCreation } from '../Models/UserForCreation';
import { forEachToken } from 'tslint';
import { SubForCreation } from '../Models/SubForCreation';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

    users: User[] = [];
    message: string;
    subUserMessage: string;
    selectedUser: User = new User();
    subs: number[] = [];

    constructor(private http: HttpClient) { }

    ngOnInit() {
        this.refreshUserList();
    }

    refreshUserList() {
        this.http.get<User[]>('api/userswithsubs/').subscribe(data => this.users = data);
    }

    subOnUser(id: number, input: string) {
        this.message = input + ' => ' + id.toString();
    }

    createUser(nameIn: string, descriptionIn: string) {
        const newUser: UserForCreation = {
            name: nameIn,
            description: descriptionIn
        };

        if (nameIn.length > 0 || descriptionIn.length > 0) {
            this.http.post(`api/users`, newUser)
                .subscribe(() => {
                        console.log('Hi');
                    },
                    (error: HttpErrorResponse) => {
                        this.message = error.message;
                    });
            this.message = '';
            (document.getElementById('userNameToCreateInput') as HTMLInputElement).value = '';
            (document.getElementById('userDescrToCreateInput') as HTMLInputElement).value = '';
            this.refreshUserList();
        } else {
            this.message = 'Name or discription is empty';
        }
    }

    deleteUser(userId: number) {
        this.http.delete(`api/users/${userId}`)
            .subscribe(() => {}, (error: HttpErrorResponse) => {});
        this.refreshUserList();
    }

    deselectUser() {
        this.selectedUser = new User();
        this.refreshUserList();
    }

    selectUser(user: User) {
        this.http.get<number[]>(`api/subs/${user.id}`).subscribe(data => {
            this.selectedUser = user;
            this.subs = data;
            this.refreshUserList();
        });
    }

    subscribe(subIdIn: number, subOnIdIn: number) {
        const newSub: SubForCreation = {
            subId: subIdIn,
            subOnId: subOnIdIn
        };

        if (subIdIn > 0 && subOnIdIn > 0) {
            this.http.post(`api/subs`, newSub)
                .subscribe(() => {
                        this.subUserMessage = '';
                        this.selectedUser.subs.push(subOnIdIn);
                        this.refreshUserList();
                        console.log(subOnIdIn);
                    },
                    (error: HttpErrorResponse) => {
                        this.subUserMessage = 'Already subscribed';
                    });
        }
    }

    unsubscribe(subIdIn: number, subOnIdIn: number) {

        this.http.delete(`api/subs/${subIdIn}/${subOnIdIn}`)
            .subscribe(() => {
              this.subUserMessage = '';
              this.selectedUser.subs.splice(this.selectedUser.subs.indexOf(subOnIdIn), 1);
              console.log(subOnIdIn);
              this.refreshUserList();
            }, (error: HttpErrorResponse) => {
              this.subUserMessage = 'No sub found';
            });
    }

}
