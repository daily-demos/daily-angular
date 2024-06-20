import { Component, Input } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import DailyIframe, {
  DailyCall,
  DailyEventObjectAppMessage,
} from "@daily-co/daily-js";

interface Message {
  name: string;
  message: string;
}

@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.css"],
})
export class ChatComponent {
  @Input() userName: string;
  callObject: DailyCall | undefined;
  messages: Array<Message> = [];
  chatIsOpen: boolean = false;

  constructor(private formBuilder: FormBuilder) {}

  chatForm = this.formBuilder.group({
    message: "",
  });

  ngOnInit(): void {
    this.callObject = DailyIframe.getCallInstance();
    if (!this.callObject) return;
    this.callObject.on("app-message", this.handleNewMessage);
  }

  ngOnDestroy(): void {
    if (!this.callObject) return;
    this.callObject.off("app-message", this.handleNewMessage);
    // Reset local var
    this.messages = [];
  }

  // Show/hide chat in UI
  toggleChatView(): void {
    this.chatIsOpen = !this.chatIsOpen;
  }

  // Add new message to message array to be displayed in UI
  handleNewMessage = (e: DailyEventObjectAppMessage<any> | undefined): void => {
    if (!e) return;
    console.log(e);
    if (e.data.event === "request-chat-history") return;
    this.messages.push({ message: e.data.message, name: e.data.name });
  };

  // Submit chat form if user presses Enter key while the textarea has focus
  onKeyDown(event: any): void {
    if (event.key === "Enter") {
      // Prevent a carriage return
      event.preventDefault();
      this.onSubmit();
    }
  }

  onSubmit(): void {
    const message = this.chatForm.value.message?.trim();
    if (!message || !this.callObject) return;

    this.callObject.sendAppMessage({
      message: message,
      name: this.userName,
    });
    // add your message to the chat (the app-message event does not get fired for your own messages, only other participants).
    this.messages.push({ message, name: "Me" });
    // clear the form input for your next message
    this.chatForm.reset();
  }
}
