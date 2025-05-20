import { Injectable } from '@angular/core';
import {AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/database';
import { Item } from './item.model';
import { AngularFireAuth } from '@angular/fire/auth';


@Injectable({
  providedIn: 'root'
})



export class ItemService {
  authState: any = null;
  itemsRef: AngularFireList<any>;
  itemRef: AngularFireObject<any>;
  private fbUID: string;
  private  defaultUID = '3llMEptxJ3bgZpRKlhr8NRgUGys1/';

  constructor(private firebasedb: AngularFireDatabase,  private firebaseAuth: AngularFireAuth) {
    this.firebaseAuth.authState.subscribe( authState => {
      this.authState = authState;
    });
  }

  addItem(item: Item) {
    this.itemsRef.push({
      name: item.name,
      description: item.description,
      iconURL: item.iconURL,
      webReference: item.webReference
    })
      .catch(error => {
        this.errorMgmt({error});
      });
  }

  getItems()  {
    console.log('getItems() auth state', this.authState);
    this.fbUID = this.defaultUID;
    if (this.authState) {
      this.fbUID = this.authState.uid;
    }
    const firebasePath = 'users/' + this.fbUID + '/icms/items';
    console.log('items.service.getItems():firebasepath', firebasePath);
    this.itemsRef = this.firebasedb.list(firebasePath);
    return this.itemsRef.snapshotChanges();
  }

  createItem(item: Item){
    this.fbUID = this.defaultUID;
    if (this.authState) {
      this.fbUID = this.authState.uid;
    }

    const firebasePath = 'users/' + this.fbUID + '/icms/items';
    return this.firebasedb.object(firebasePath).set(item);
  }

  updateItem(item: Item ){
    this.fbUID = this.defaultUID;
    if (this.authState) {
      this.fbUID = this.authState.uid;
    }

    const firebasePath = 'users/' + this.fbUID + '/icms/items';
    return this.firebasedb.object(firebasePath).update(item);
  }

  deleteItem(itemID: string){
    this.fbUID = this.defaultUID;
    if (this.authState) {
      this.fbUID = this.authState.uid;
    }

    const firebasePath = 'users/' + this.fbUID + '/icms/items';
    return this.firebasedb.object(firebasePath).remove();
  }

  private errorMgmt(parameters: { error: any }) {
    const error = parameters.error;
    console.log(error);
  }
}

