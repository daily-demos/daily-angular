import { Component, EventEmitter, Output } from "@angular/core";
import { FormBuilder } from "@angular/forms";

@Component({
  selector: "join-form",
  templateUrl: "./join-form.component.html",
  styleUrls: ["./join-form.component.css"],
})
export class JoinFormComponent {
  @Output() setUserName: EventEmitter<string> = new EventEmitter();
  @Output() setUrl: EventEmitter<string> = new EventEmitter();

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
