import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SocketService } from '@services/socket/socket.service';
import { ToastrService } from 'ngx-toastr';
// import { MatT }

@Component({
  selector: 'app-table-details',
  templateUrl: './table-details.component.html',
  styleUrls: ['./table-details.component.scss']
})
export class TableDetailsComponent implements OnInit, AfterViewInit, OnDestroy {

  public tableId: string;
  private subscriptions: Subscription[];

  constructor(private route: ActivatedRoute, private socket: SocketService, private router: Router, private toastr: ToastrService) {
    this.tableId = '';
    this.subscriptions = [];
  }

  ngOnInit() {
    this.subscriptions.push(this.route.params.subscribe(params => {
      this.tableId = params.id;
    }));
    this.subscriptions.push(this.socket.onTableStatusChanged().subscribe( (tableId) => {
      if (this.tableId === tableId) {
        this.toastr.warning('The table you were inspecting has been freed', 'Table freed');
        this.router.navigateByUrl('tables');
      }
    }));
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

}
