import sys


def main(argv: list[str] | None = None) -> None:
	print(argv)


if __name__ == '__main__':
	main(sys.argv[1:])
