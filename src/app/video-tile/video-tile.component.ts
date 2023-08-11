import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from "@angular/core";

@Component({
  selector: "video-tile",
  templateUrl: "./video-tile.component.html",
  styleUrls: ["./video-tile.component.css"],
})
export class VideoTileComponent {
  @Input() joined: boolean;
  // @Input() participant: Participant;
  @Input() videoOn: boolean;
  @Input() audioOn: boolean;
  @Input() local: boolean;
  @Input() userName: string;
  @Input() videoTrack: MediaStreamTrack | undefined;
  @Input() audioTrack: MediaStreamTrack | undefined;
  videoStream: MediaStream | undefined;
  audioStream: MediaStream | undefined;

  @Output() leaveCallClick: EventEmitter<null> = new EventEmitter();
  @Output() toggleVideoClick: EventEmitter<null> = new EventEmitter();
  @Output() toggleAudioClick: EventEmitter<null> = new EventEmitter();

  ngOnInit(): void {
    console.log("on tile init");
    if (this.videoTrack) {
      this.updateVidStream(this.videoTrack);
    }
    if (this.audioTrack) {
      this.updateAudStream(this.audioTrack);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log("tile on change");
    if (changes["videoTrack"] && changes["videoTrack"].currentValue) {
      this.updateVidStream(changes["videoTrack"].currentValue);
    }
    if (changes["audioTrack"] && changes["audioTrack"].currentValue) {
      this.updateAudStream(changes["audioTrack"].currentValue);
    }
  }

  updateVidStream(track: MediaStreamTrack) {
    this.videoStream = new MediaStream([track]);
  }

  updateAudStream(track: MediaStreamTrack) {
    this.audioStream = new MediaStream([track]);
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
