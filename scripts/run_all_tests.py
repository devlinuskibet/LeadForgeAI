import os
import sys
import unittest

def main():
    print("=" * 60)
    print(" LeadForgeAI Automated Test Suite Runner")
    print("=" * 60)

    # Set PYTHONPATH
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    backend_path = os.path.join(project_root, "backend")
    sys.path.insert(0, backend_path)

    tests_dir = os.path.join(backend_path, "tests")
    print(f"Discovering tests in: {tests_dir}")

    loader = unittest.TestLoader()
    suite = loader.discover(start_dir=tests_dir, pattern="test_*.py")

    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    if result.wasSuccessful():
        print("\n[SUCCESS] ALL BACKEND TESTS PASSED SUCCESSFULLY!")
        sys.exit(0)
    else:
        print("\n[FAILURE] BACKEND TEST SUITE FAILED!")
        sys.exit(1)

if __name__ == "__main__":
    main()
