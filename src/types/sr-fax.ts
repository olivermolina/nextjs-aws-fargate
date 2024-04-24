export type IReceivedFax = {
  FileName: string;
  ReceiveStatus: string;
  Date: string;
  EpochTime: string;
  CallerID: string;
  RemoteID: string;
  Pages: number;
  Size: number;
};

export type ISentFax = {
  FileName: string;
  ReceiveStatus: string;
  Date: string;
  EpochTime: string;
  CallerID: string;
  RemoteID: string;
  Pages: number;
  Size: number;
  SentStatus: string;
  DateQueued: string;
  DateSent: string;
  ToFaxNumber: string;
  Duration: string;
  ErrorCode: string;
  AccountCode: string;
  SenderEmail: string;
  Subject: 'Test';
  SubmittedFiles: string;
};
