import { Component, OnInit } from '@angular/core';
import { User } from '../Models/User';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Post } from '../Models/Post';
import { PostForCreation } from '../Models/PostForCreation';
import { Observable } from 'rxjs';
import * as signalR from '@aspnet/signalr';
import { LogLevel } from '@aspnet/signalr';

// @ts-ignore
@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

    selectedUser: User = new User();
    posts: Post[] = [];
    postMessage: string;
    message: string;

    constructor(private http: HttpClient) {}

    ngOnInit() {
        const connection =  new signalR.HubConnectionBuilder()
            .withUrl('https://localhost:5001/message', {})
            .configureLogging(LogLevel.Information)
            .build();

        connection.on('send', data => {
            const post: Post = data;
            if (post.postId !== null && post.postId !== undefined) {
                if (this.selectedUser.id !== undefined && this.selectedUser.id !== null) {
                    if (this.selectedUser.subs.includes(post.userId)) {
                        this.posts.unshift(post);
                    }
                }
            }

        });

        connection.start().then( () => connection.invoke('send', 'hello'));

    }

    selectUser(userName: string) {
        this.http.get<User>(`api/userswithsubs/${userName}`).subscribe(data => {
            this.selectedUser = data;
            // console.log(data);
            if (data !== null && data !== undefined) {
                this.getPosts(userName);
            }
        }, (error: HttpErrorResponse) => {
            this.deselectUser();
            if (userName === '') {
                this.postMessage = 'User input is empty';
            } else {
                this.postMessage = 'User not found';
            }
        });
    }

    deselectUser() {
        this.selectedUser = new User();
        this.posts = [];
    }

    onInput(event: KeyboardEvent, value: string) {
        if (event.code === 'Enter') {
            this.selectUser(value);
        }
    }

    getPosts(value: string) {
        this.http.get<Post[]>(`api/subs/${value}`)
            .subscribe(data => {
                if (true) {
                    this.posts = data;
                    this.postMessage = '';
                } else {
                    this.postMessage = 'User not found';
                }

                },
                (error: HttpErrorResponse) => {});
    }

    tryCreatePost(userName: string, titleIn: string, bodyIn: string) {
        const newPost: PostForCreation = {
            title: titleIn,
            body: bodyIn
        };

        if (newPost.title === '' || newPost.body === '' || userName === '') {
            this.message = 'Name, title or body is empty!';
        } else {
            this.http.post(`api/users/${userName}/posts`, newPost)
                .subscribe(() => {
                        // this.getPosts((document.getElementById('userNameInput') as HTMLInputElement).value);
                    },
                    (error: HttpErrorResponse) => {
                        this.message = error.message;
                    });
            this.message = '';
            (document.getElementById('userToCreateNameInput') as HTMLInputElement).value = '';
            (document.getElementById('postTitleInput') as HTMLInputElement).value = '';
            (document.getElementById('postBodyInput') as HTMLInputElement).value = '';
        }
    }

    delete(postId: number) {
        this.http.delete(`api/posts/${postId}`)
            .subscribe(() => this.postMessage = '', (error: HttpErrorResponse) => {
                this.postMessage = error.message;
            });
        this.getPosts((document.getElementById('userNameInput') as HTMLInputElement).value);
    }

}
