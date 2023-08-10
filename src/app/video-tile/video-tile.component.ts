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
  // @Input() isLocal: boolean;
  // @Input() name: string;
  // @Input() videoIsOn: boolean;
  // @Input() audioIsOn: boolean;
  // @Input() videoStream: MediaStream | undefined | null;
  // @Input() audioStream: MediaStream | undefined | null;

  @Output() leaveCallClick: EventEmitter<null> = new EventEmitter();
  @Output() toggleVideoClick: EventEmitter<null> = new EventEmitter();
  @Output() toggleAudioClick: EventEmitter<null> = new EventEmitter();

  ngOnInit(): void {
    console.log("on tile init");
    // Add tracks when the participant joins
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log("tile on change");
    console.log(changes);
    if (!changes["participant"].previousValue) {
      // If tracks weren't available on join, add tracks after the first update
    }
  }

  ngDoCheck() {
    console.log("do check");
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
