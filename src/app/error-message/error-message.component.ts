import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "error-message",
  templateUrl: "./error-message.component.html",
  styleUrls: ["./error-message.component.css"],
})
export class ErrorMessageComponent {
  @Input() error: any;
  @Output() reset: EventEmitter<any> = new EventEmitter();

  handleGoHome(): void {
    // Emit event to alert parent component to reset UI
    this.reset.emit();
  }
}
