enum Suit {
  sun, // 주작·해 (최강)
  moon, // 청룡·달
  star, // 현무·별
  cloud, // 백호·구름 (최약)
}

class Tile {
  final String id;
  final int number; // 1~15
  final Suit suit;

  const Tile({required this.id, required this.number, required this.suit});

  factory Tile.fromJson(Map<String, dynamic> json) => Tile(
    id: json['id'] as String,
    number: json['number'] as int,
    suit: Suit.values.byName(json['suit'] as String),
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'number': number,
    'suit': suit.name,
  };

  @override
  String toString() => '${suit.name} $number';

  @override
  bool operator ==(Object other) => other is Tile && other.id == id;

  @override
  int get hashCode => id.hashCode;
}
