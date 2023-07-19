import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import DailyIframe, {
  DailyCall,
  DailyEventObjectAppMessage,
  DailyEventObjectParticipant,
  DailyParticipant,
  DailyEventObjectFatalError,
  DailyEventObjectCameraError,
  DailyEventObjectParticipants,
  DailyEventObjectNetworkConnectionEvent,
  DailyRoomInfo,
  DailyEventObjectParticipantLeft,
} from "@daily-co/daily-js";

@Component({
  selector: "join-form",
  templateUrl: "./join-form.component.html",
  styleUrls: ["./join-form.component.css"],
})
export class JoinFormComponent {
  @Output() setCallObject: EventEmitter<DailyCall> = new EventEmitter();
  callObject: DailyCall;

  joinForm = this.formBuilder.group({
    name: "",
    url: "",
  });

  constructor(private formBuilder: FormBuilder) {}

  onSubmit(): void {
    this.callObject = DailyIframe.createCallObject();
    console.log("The join form submitted:", this.joinForm.value);

    // Join Daily call
    this.callObject.join({
      userName: this.joinForm.value.name!, // not null to make TypeScript happy
      url: this.joinForm.value.url!,
    });

    // Clear form inputs
    this.joinForm.reset();
    // Emit event to update callObject var in parent component
    this.setCallObject.emit(this.callObject);
  }
}
