import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-accomodate-dialog',
  templateUrl: './accomodate-dialog.component.html',
  styleUrls: ['./accomodate-dialog.component.scss']
})
export class AccomodateDialogComponent implements OnInit {

  public seats: number;
  public tableNumber: number;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<AccomodateDialogComponent>) {
    this.seats = data.seats;
    this.tableNumber = data.tableNumber;
  }

  ngOnInit() {
  }

  public closeDialog(customers?: number) {
    if (customers) {
      this.dialogRef.close(customers);
    } else {
      this.dialogRef.close();
    }
  }

}
