import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'router.dart';

void main() {
  runApp(const ProviderScope(child: FggApp()));
}

class FggApp extends StatelessWidget {
  const FggApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'FGG',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF111827),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF2563EB),
          brightness: Brightness.dark,
        ),
        snackBarTheme: const SnackBarThemeData(
          backgroundColor: Color(0xFF1F2937),
          contentTextStyle: TextStyle(color: Colors.white),
        ),
      ),
      routerConfig: router,
    );
  }
}
