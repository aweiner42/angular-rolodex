import { Component, OnInit } from '@angular/core';
import { ItemService} from '../item.service';
import { Item } from '../item.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.scss']
})

export class ItemListComponent implements OnInit {

  theItems: Observable<any[]>;

  constructor(private itemService: ItemService) { }

  ngOnInit(): void {
    console.log('item-list.component.onInit()');
    this.theItems = this.itemService.getItems().pipe(
      map( changes =>
      changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );
  }

  create(item: Item){
    this.itemService.createItem(item);
  }

  update(item: Item){
    this.itemService.updateItem(item);
  }

  delete(id: string) {
    this.itemService.deleteItem(id);
  }
}
