import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { ItemType } from '@models/item.model';

@Component({
  selector: 'app-add-item-dialog',
  templateUrl: './add-item-dialog.component.html',
  styleUrls: ['./add-item-dialog.component.scss']
})
export class AddItemDialogComponent implements OnInit {

  public name: string;
  public price: number;
  public type: ItemType;
  public tag: string;
  public timeRequired: number;

  constructor(private dialogRef: MatDialogRef<AddItemDialogComponent>) {
  }

  ngOnInit() {
  }

  public createItem(submit: boolean) {
    if (submit) {
      this.dialogRef.close({name: this.name, price: this.price, type: this.type, tag: this.tag, timeRequired: this.timeRequired});
    } else {
      this.dialogRef.close();
    }
  }

  public getItemTypes(): string[] {
    return Object.values(ItemType);
  }

}
