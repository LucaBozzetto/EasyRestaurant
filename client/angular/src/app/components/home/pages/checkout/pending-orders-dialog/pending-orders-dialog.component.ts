import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-pending-orders-dialog',
  templateUrl: './pending-orders-dialog.component.html',
  styleUrls: ['./pending-orders-dialog.component.scss']
})
export class PendingOrdersDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<PendingOrdersDialogComponent>) { }

  ngOnInit() {
  }

  public closeDialog(confirmation: boolean) {
      this.dialogRef.close(confirmation);
  }

}
