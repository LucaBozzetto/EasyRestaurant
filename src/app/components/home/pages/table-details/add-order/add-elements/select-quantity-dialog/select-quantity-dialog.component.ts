import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-select-quantity-dialog',
  templateUrl: './select-quantity-dialog.component.html',
  styleUrls: ['./select-quantity-dialog.component.scss']
})
export class SelectQuantityDialogComponent implements OnInit {

  public id: string;
  public name: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<SelectQuantityDialogComponent>) {
    this.name = data.name;
    this.id = data.itemId;
  }

  ngOnInit() {
  }

  public closeDialog(quantity?: number) {
    if (quantity) {
      this.dialogRef.close(quantity);
    } else {
      this.dialogRef.close();
    }
  }

}
