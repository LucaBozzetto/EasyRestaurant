import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ItemService } from '@services/item/item.service';
import { Item, ItemType } from '@models/item.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-element-dialog',
  templateUrl: './edit-element-dialog.component.html',
  styleUrls: ['./edit-element-dialog.component.scss']
})
export class EditElementDialogComponent implements OnInit, OnDestroy {

  public id: string;
  public name: string;
  public extra: [];
  public note: string;
  public extraList: Item[];

  public selectedValues: string[];

  private subscriptions: Subscription[];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<EditElementDialogComponent>,
              private itemService: ItemService) {
    this.name = data.name;
    this.id = data.itemId;
    this.extra = data.extra;
    this.note = data.note;
    this.selectedValues = [];

    if (this.extra) {
      this.extra.forEach( (obj: any) => {
        this.selectedValues.push(obj._id);
      });
    }

    this.subscriptions = [];
  }

  ngOnInit() {
    this.subscriptions.push(this.itemService.getItemList().subscribe( (itemList) => {
      this.extraList = itemList.filter( (item) => item.type === ItemType.Extra);
    }));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  // FIXME: This function is awfully ugly, please refactor it!
  public closeDialog(extraIngredients?: any, note?: string) {
    if (extraIngredients && extraIngredients.length > 0 && note) {

      const ingredients = [];
      extraIngredients.forEach( (id) => {
        const obj: any = {};
        obj._id = id;
        obj.name = this.extraList.find( (extra) => extra._id === id).name;
        ingredients.push(obj);
      });

      this.dialogRef.close({ingredients, note});
    } else if (extraIngredients && extraIngredients.length > 0) {

      const ingredients = [];
      extraIngredients.forEach( (id) => {
        const obj: any = {};
        obj._id = id;
        obj.name = this.extraList.find( (extra) => extra._id === id).name;
        ingredients.push(obj);
      });

      this.dialogRef.close({ingredients});
    } else if (note) {
      this.dialogRef.close({note});
    } else {
      this.dialogRef.close();
    }
  }

}
