import { Component } from "@angular/core";
import { DailyCall } from "@daily-co/daily-js";

@Component({
  selector: "app-daily-container",
  templateUrl: "./daily-container.component.html",
  styleUrls: ["./daily-container.component.css"],
})
export class DailyContainerComponent {
  // Store callObject in this parent container.
  // Most callObject logic in CallComponent.
  callObject: DailyCall | null;

  setCallObject(co: DailyCall): void {
    // Event is emitted from CallComponent
    this.callObject = co;
  }

  callEnded(): void {
    // Event is emitted from CallComponent
    console.log("resetting call object in container");
    // Truthy value will show the CallComponent; otherwise, the JoinFormComponent is shown.
    this.callObject = null;
  }
}
