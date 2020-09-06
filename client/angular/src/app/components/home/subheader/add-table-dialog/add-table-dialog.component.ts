import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-table-dialog',
  templateUrl: './add-table-dialog.component.html',
  styleUrls: ['./add-table-dialog.component.scss']
})
export class AddTableDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<AddTableDialogComponent>) { }

  ngOnInit() {
  }

  public closeDialog(seats?: number) {
    if (seats) {
      this.dialogRef.close(seats);
    } else {
      this.dialogRef.close();
    }
  }

}
