export type JudiciousModule = {
  module: string;
  summary: string;
  officialBaseUrl?: string;
  elements: JudiciousElement[];
};

export type JudiciousElement =
  | JudiciousFunction
  | JudiciousType
  | JudiciousConstant;

type JudiciousElementCommon = {
  examples?: JudiciousExample[];
  urlSuffix?: string;
};

export type JudiciousFunction = {
  kind: 'function';
  section?: string;
  name: string;
  description: JudiciousDescription;
  parameters: JudiciousParameter[];
  returnValue?: {
    type: string;
    description: string;
  };
  sideEffects?: boolean;
} & JudiciousElementCommon;

export type JudiciousDescription = {
  p: string[];
  figure?: {
    url: string;
    caption: string;
  };
};

export type JudiciousParameter = {
  name: string;
  type: string;
  description: string;
  default?: string;
  variableLength?: boolean;
};

export type JudiciousType = {
  kind: 'type';
} & JudiciousSimpleElement &
  JudiciousElementCommon;

export type JudiciousConstant = {
  kind: 'constant';
  type: string;
} & JudiciousSimpleElement &
  JudiciousElementCommon;

export type JudiciousSimpleElement = {
  name: string;
  description: JudiciousDescription;
  section?: string;
};

export type JudiciousExample = {
  code: string;
  result?: string;
  error?: string;
  stdin?: string;
  stdout?: string;
  usesOptional?: boolean;
};
