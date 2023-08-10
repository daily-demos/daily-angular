import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from "@angular/core";
import { Participant } from "../call/call.component";

@Component({
  selector: "video-tile",
  templateUrl: "./video-tile.component.html",
  styleUrls: ["./video-tile.component.css"],
})
export class VideoTileComponent {
  @Input() joined: boolean;
  @Input() participant: Participant;

  @Output() leaveCallClick: EventEmitter<null> = new EventEmitter();
  @Output() toggleVideoClick: EventEmitter<null> = new EventEmitter();
  @Output() toggleAudioClick: EventEmitter<null> = new EventEmitter();

  ngOnInit(): void {
    console.log("on tile init");
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log("tile on change");
  }

  ngDoCheck() {
    console.log("do check");
    // to do: check if the original participant values have changed
  }

  toggleVideo(): void {
    this.toggleVideoClick.emit();
  }

  toggleAudio(): void {
    this.toggleAudioClick.emit();
  }

  handleLeaveCallClick(): void {
    this.leaveCallClick.emit();
  }
}
