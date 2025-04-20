{
  description = "Shortcut game";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    bunnix.url = "github:aster-void/bunnix";
  };

  outputs = {
    nixpkgs,
    flake-utils,
    bunnix,
    ...
  }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = nixpkgs.legacyPackages.${system};
    in {
      devShells.default = pkgs.mkShell {
        packages = [
          bunnix.packages.${system}.v1_2_10
          pkgs.nodejs-slim
        ];
      };
    });
}
