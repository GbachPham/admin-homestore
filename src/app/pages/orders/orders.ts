import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Order, OrderService, OrderStats } from '../../services/order.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.html',
  styleUrls: ['./orders.scss']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  stats: OrderStats | null = null;
  selectedStatus: string = '';
  searchCustomerName: string = '';
  loading: boolean = false;
  error: string = '';
  showDetailModal: boolean = false;
  selectedOrder: Order | null = null;

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.loadOrders();
    this.loadStats();
  }

  loadOrders() {
    this.loading = true;
    this.error = '';
    
    this.orderService.getAllOrders(this.selectedStatus, this.searchCustomerName)
      .subscribe({
        next: (data) => {
          this.orders = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load orders. Please try again.';
          this.loading = false;
        }
      });
  }

  loadStats() {
    this.orderService.getOrderStats()
      .subscribe({
        next: (data) => {
          this.stats = data;
        },
        error: (err) => {
          console.error('Failed to load order statistics:', err);
        }
      });
  }

  updateStatus(order: Order, newStatus: string) {
    this.orderService.updateOrderStatus(order.id, newStatus)
      .subscribe({
        next: (updatedOrder) => {
          const index = this.orders.findIndex(o => o.id === updatedOrder.id);
          if (index !== -1) {
            this.orders[index] = updatedOrder;
          }
          this.loadStats(); // Refresh statistics
        },
        error: (err) => {
          console.error('Failed to update order status:', err);
        }
      });
  }

  onStatusChange() {
    this.loadOrders();
  }

  onSearch() {
    this.loadOrders();
  }

  clearSearch() {
    this.searchCustomerName = '';
    this.selectedStatus = '';
    this.loadOrders();
  }

  viewOrderDetail(order: Order) {
    this.selectedOrder = order;
    this.showDetailModal = true;
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.selectedOrder = null;
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'confirmed': return 'status-confirmed';
      case 'processing': return 'status-processing';
      case 'shipping': return 'status-shipping';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }

  getPaymentStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return 'payment-pending';
      case 'paid': return 'payment-paid';
      case 'failed': return 'payment-failed';
      default: return '';
    }
  }
}
