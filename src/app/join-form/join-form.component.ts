import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import DailyIframe, { DailyCall } from "@daily-co/daily-js";

@Component({
  selector: "join-form",
  templateUrl: "./join-form.component.html",
  styleUrls: ["./join-form.component.css"],
})
export class JoinFormComponent {
  @Output() setCallObject: EventEmitter<DailyCall> = new EventEmitter();
  @Output() setUserName: EventEmitter<string> = new EventEmitter();
  @Output() setUrl: EventEmitter<string> = new EventEmitter();
  callObject: DailyCall;

  joinForm = this.formBuilder.group({
    name: "",
    url: "",
  });

  constructor(private formBuilder: FormBuilder) {}

  onSubmit(): void {
    const { name, url } = this.joinForm.value;
    if (!name || !url) return;

    // Clear form inputs
    this.joinForm.reset();
    // Emit event to update userName var in parent component
    this.setUserName.emit(name);
    // Emit event to update URL var in parent component
    this.setUrl.emit(url);
  }
}
