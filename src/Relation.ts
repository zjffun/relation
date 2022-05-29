export class Relation {
  id: string;
  commitid1: string;
  commitid2: string;
  path1: string;
  path2: string;
  line1: [Number, Number];
  line2: [Number, Number];
  bidirection: boolean;

  constructor(relation: Relation) {
    this.id = relation.id;
    this.bidirection = relation.bidirection;
    this.commitid1 = relation.commitid1;
    this.commitid2 = relation.commitid2;
    this.path1 = relation.path1;
    this.path2 = relation.path2;
    this.line1 = relation.line1;
    this.line2 = relation.line2;
  }
}
